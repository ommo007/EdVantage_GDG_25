import { useState } from "react";
import { Upload, X, Check, AlertCircle, FileText, Users, Wifi, WifiOff } from "lucide-react";
import Papa from "papaparse";
import { createUserWithSignUp, createUserProfile, testConnection } from "../../lib/supabaseAdmin";

const CSVImport = ({ isOpen, onClose, onSuccess, divisionId, divisionName }) => {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        validateCSVData(results.data);
      },
      error: (error) => {
        console.error("CSV parsing error:", error);
        setValidationErrors(["Failed to parse CSV file. Please check the format."]);
      }
    });
  };

  const validateCSVData = (data) => {
    const errors = [];
    
    if (data.length === 0) {
      errors.push("CSV file is empty");
      setValidationErrors(errors);
      return;
    }

    // Check if required columns exist
    const firstRow = data[0];
    if (!firstRow.hasOwnProperty('email')) {
      errors.push("Missing 'email' column in CSV");
    }
    if (!firstRow.hasOwnProperty('password')) {
      errors.push("Missing 'password' column in CSV");
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we have header row
      
      if (!row.email || !row.email.trim()) {
        errors.push(`Row ${rowNumber}: Email is required`);
      } else if (!isValidEmail(row.email)) {
        errors.push(`Row ${rowNumber}: Invalid email format`);
      }
      
      if (!row.password || !row.password.trim()) {
        errors.push(`Row ${rowNumber}: Password is required`);
      } else if (row.password.length < 6) {
        errors.push(`Row ${rowNumber}: Password must be at least 6 characters`);
      }
    });

    setValidationErrors(errors);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const testConnectionHandler = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    
    console.log('🧪 Testing Supabase connection from CSV Import...');
    
    try {
      const result = await testConnection();
      
      if (result.success) {
        setConnectionStatus({ success: true, message: 'Connection successful! Ready to import students.' });
        console.log('✅ Connection test passed');
      } else {
        setConnectionStatus({ 
          success: false, 
          message: `Connection failed: ${result.error?.message || 'Unknown error'}` 
        });
        console.error('❌ Connection test failed:', result.error);
      }
    } catch (error) {
      setConnectionStatus({ 
        success: false, 
        message: `Connection error: ${error.message}` 
      });
      console.error('❌ Connection test error:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const processCSV = async () => {
    if (validationErrors.length > 0) {
      alert("Please fix validation errors before processing");
      return;
    }

    // Test connection first
    console.log('🔍 Testing connection before processing CSV...');
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      alert(`Connection failed: ${connectionTest.error?.message || 'Unable to connect to Supabase'}. Please check your configuration.`);
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    
    const successfulCreations = [];
    const failedCreations = [];
    const total = csvData.length;

    console.log(`📊 Starting bulk import of ${total} students...`);

    for (let i = 0; i < csvData.length; i++) {
      const student = csvData[i];
      const progressPercent = ((i + 1) / total) * 100;
      setProgress(progressPercent);

      console.log(`📝 Processing student ${i + 1}/${total}: ${student.email}`);

      try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await createUserWithSignUp(
          student.email.trim(), 
          student.password.trim()
        );

        if (authError) {
          throw authError;
        }

        if (!authData?.user?.id) {
          throw new Error('User creation succeeded but no user ID returned');
        }

        // Create student profile in database
        const { error: profileError } = await createUserProfile(authData.user.id, {
          email: student.email.trim(),
          role_id: 3, // Student role
          division_id: divisionId,
          display_name: student.name || student.email.split('@')[0],
          created_at: new Date().toISOString()
        });

        if (profileError) {
          console.warn(`⚠️ User created but profile failed for ${student.email}:`, profileError);
          // Still count as success since user was created
        }

        successfulCreations.push({
          email: student.email,
          name: student.name || student.email.split('@')[0],
          userId: authData.user.id
        });

        console.log(`✅ Successfully processed: ${student.email}`);

      } catch (error) {
        console.error(`❌ Failed to process ${student.email}:`, error);
        failedCreations.push({
          email: student.email,
          error: error.message || 'Unknown error occurred'
        });
      }

      // Small delay to prevent rate limiting
      if (i < csvData.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`📈 Import completed: ${successfulCreations.length} successful, ${failedCreations.length} failed`);

    setResults({
      successful: successfulCreations,
      failed: failedCreations,
      total: total
    });

    setIsProcessing(false);
    
    if (successfulCreations.length > 0) {
      onSuccess(successfulCreations.length);
    }
  };

  const resetForm = () => {
    setFile(null);
    setCsvData([]);
    setValidationErrors([]);
    setProgress(0);
    setResults(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-indigo-900">
            Import Students from CSV - {divisionName}
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!results ? (
          <>
            {/* File Upload Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload CSV file or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    CSV should contain 'email' and 'password' columns
                  </p>
                </label>
              </div>
            </div>

            {/* CSV Format Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">CSV Format Requirements:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Required columns: <code className="bg-blue-100 px-1 rounded">email</code>, <code className="bg-blue-100 px-1 rounded">password</code></li>
                <li>• Optional column: <code className="bg-blue-100 px-1 rounded">name</code></li>
                <li>• Email must be valid format</li>
                <li>• Password must be at least 6 characters</li>
                <li>• First row should contain column headers</li>
              </ul>
            </div>

            {/* Connection Test */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">Database Connection</h3>
                <button
                  onClick={testConnectionHandler}
                  disabled={isTestingConnection}
                  className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isTestingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 mr-1" />
                      Test Connection
                    </>
                  )}
                </button>
              </div>
              
              {connectionStatus && (
                <div className={`flex items-center p-2 rounded text-sm ${
                  connectionStatus.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {connectionStatus.success ? (
                    <Wifi className="h-4 w-4 mr-2" />
                  ) : (
                    <WifiOff className="h-4 w-4 mr-2" />
                  )}
                  {connectionStatus.message}
                </div>
              )}
              
              {!connectionStatus && (
                <p className="text-sm text-gray-600">
                  Test the connection to ensure CSV import will work properly.
                </p>
              )}
            </div>

            {/* File Info */}
            {file && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({csvData.length} rows)
                  </span>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="text-sm font-medium text-red-900">
                    Validation Errors ({validationErrors.length})
                  </h3>
                </div>
                <ul className="text-sm text-red-800 space-y-1 max-h-32 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Data */}
            {csvData.length > 0 && validationErrors.length === 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Preview ({csvData.length} students)
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-40 overflow-y-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Email</th>
                          <th className="px-3 py-2 text-left">Password</th>
                          <th className="px-3 py-2 text-left">Name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {csvData.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">{row.email}</td>
                            <td className="px-3 py-2">{"*".repeat(row.password?.length || 0)}</td>
                            <td className="px-3 py-2">{row.name || "Auto-generated"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvData.length > 5 && (
                    <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500">
                      ... and {csvData.length - 5} more rows
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Processing Progress */}
            {isProcessing && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Creating student accounts...</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={processCSV}
                disabled={!file || validationErrors.length > 0 || isProcessing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Create Students
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Results Section */
          <div>
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Import Complete</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-800">Successfully created:</span>
                <span className="font-medium text-green-900">{results.successful.length} students</span>
              </div>
              
              {results.failed.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-red-800">Failed to create:</span>
                  <span className="font-medium text-red-900">{results.failed.length} students</span>
                </div>
              )}
            </div>

            {results.failed.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Failed Creations:</h4>
                <div className="max-h-32 overflow-y-auto border rounded-lg">
                  {results.failed.map((failure, index) => (
                    <div key={index} className="p-2 border-b last:border-b-0 text-sm">
                      <span className="text-gray-900">{failure.email}</span>
                      <span className="text-red-600 ml-2">- {failure.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button 
                onClick={handleClose}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVImport; 