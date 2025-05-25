# CSV Import Guide for Student Bulk Creation

## Overview

The CSV Import feature allows administrators to bulk create student accounts by uploading a CSV file containing student information. This feature is available in the Division Dashboard under the Students tab.

## How to Use

### 1. Access the CSV Import Feature

1. Navigate to the Division Dashboard for the specific division where you want to add students
2. Click on the "Students" tab
3. Click the green "Import CSV" button next to the "Add Student" button

### 2. Prepare Your CSV File

Your CSV file must contain the following columns:

#### Required Columns:
- `email` - Student's email address (must be valid email format)
- `password` - Student's password (minimum 6 characters)

#### Optional Columns:
- `name` - Student's full name (if not provided, will be auto-generated from email)

#### Example CSV Format:

**Minimal Format (Required columns only):**
```csv
email,password
john.doe@example.com,password123
jane.smith@example.com,securepass456
mike.johnson@example.com,mypassword789
```

**Full Format (With optional name column):**
```csv
email,password,name
john.doe@example.com,password123,John Doe
jane.smith@example.com,securepass456,Jane Smith
mike.johnson@example.com,mypassword789,Mike Johnson
```

### 3. Upload and Validate

1. Click "Click to upload CSV file" or drag and drop your CSV file
2. The system will automatically validate your data and show:
   - File information (name and number of rows)
   - Preview of the data (first 5 rows)
   - Any validation errors that need to be fixed

### 4. Review and Import

1. Review the preview to ensure data is correct
2. Fix any validation errors if they appear
3. Click "Create Students" to start the import process
4. Monitor the progress bar as accounts are created
5. Review the results summary showing successful and failed creations

## Validation Rules

The system validates the following:

- **Email Format**: Must be a valid email address
- **Email Uniqueness**: Email addresses must not already exist in the system
- **Password Length**: Passwords must be at least 6 characters long
- **Required Fields**: Email and password fields cannot be empty
- **CSV Format**: File must be a valid CSV with proper headers

## Error Handling

If some student accounts fail to create, the system will:
- Show a detailed list of failed creations with error messages
- Still create the successful accounts
- Allow you to download or review the failed entries for correction

## Sample CSV Files

Sample CSV files are available to demonstrate the correct format:
- `/public/sample-students.csv` - Full format with name column (25 sample students)
- `/public/minimal-students.csv` - Minimal format with only required columns (3 test students)

## Technical Details

### Authentication
- Student accounts are created using Supabase Auth
- Passwords are securely hashed by Supabase
- Email confirmation is automatically set to true

### Database Integration
- Student profiles are created in the `profiles` table
- Students are automatically assigned to the current division
- Role is set to Student (role_id: 3)

### Security Considerations
- Admin operations require service role permissions
- CSV processing happens client-side for immediate feedback
- Sensitive operations are logged for audit purposes

## Troubleshooting

### Common Issues:

1. **"Missing service role key" error**
   - Ensure VITE_SUPABASE_SERVICE_ROLE_KEY is set in environment variables
   - Contact system administrator for proper configuration

2. **"Email already exists" errors**
   - Check if students are already registered in the system
   - Remove duplicate emails from your CSV file

3. **CSV parsing errors**
   - Ensure your file is saved as CSV format
   - Check that column headers match exactly: `email`, `password`, `name`
   - Remove any special characters or formatting from the file

4. **Validation errors**
   - Review the error list and fix issues in your CSV file
   - Re-upload the corrected file

### Best Practices:

- Test with a small batch first (5-10 students)
- Keep passwords secure and follow your institution's password policy
- Backup your CSV file before uploading
- Inform students of their login credentials securely
- Monitor the import process and review results carefully

## Support

For technical support or questions about the CSV import feature, contact your system administrator or refer to the main application documentation. 