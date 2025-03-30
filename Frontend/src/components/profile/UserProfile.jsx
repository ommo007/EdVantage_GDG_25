import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Edit, Save, X, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../firebase/firestore';
import DashboardHeader from '../shared/DashboardHeader';

const UserProfile = () => {
  const { currentUser, userProfile, userRole } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    bio: '',
    location: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        bio: userProfile?.bio || '',
        location: userProfile?.location || '',
        phoneNumber: userProfile?.phoneNumber || ''
      });
    }
  }, [currentUser, userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await updateUserProfile(currentUser.uid, {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        phoneNumber: formData.phoneNumber
      });

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <DashboardHeader userRole={userRole} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-indigo-900 mb-8">Your Profile</h1>

          {message.text && (
            <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
            <div className="bg-indigo-600 h-32 relative">
              {currentUser?.photoURL ? (
                <div className="absolute -bottom-16 left-8">
                  <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white">
                    <img 
                      src={currentUser.photoURL} 
                      alt={formData.displayName || 'User'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="absolute -bottom-16 left-8">
                  <div className="h-32 w-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center">
                    <User className="h-16 w-16 text-indigo-400" />
                  </div>
                </div>
              )}
              
              {editMode && (
                <button className="absolute -bottom-8 left-24 bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="pt-20 px-8 pb-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-900">
                    {formData.displayName || 'User Profile'}
                  </h2>
                  <div className="flex items-center mt-2 text-indigo-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex items-center mt-1 text-indigo-600">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span className="capitalize">{userRole}</span>
                  </div>
                </div>
                
                {editMode ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Saving...' : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-indigo-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-2 border border-indigo-200 rounded-md bg-indigo-50 text-indigo-500"
                      />
                      <p className="mt-1 text-xs text-indigo-400">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-indigo-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    ></textarea>
                  </div>
                </form>
              ) : (
                <div className="mt-6 space-y-6">
                  {formData.bio && (
                    <div>
                      <h3 className="text-lg font-medium text-indigo-900 mb-2">About</h3>
                      <p className="text-indigo-600">{formData.bio}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.location && (
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <h4 className="text-sm font-medium text-indigo-700 mb-1">Location</h4>
                        <p className="text-indigo-900">{formData.location}</p>
                      </div>
                    )}
                    
                    {formData.phoneNumber && (
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <h4 className="text-sm font-medium text-indigo-700 mb-1">Phone</h4>
                        <p className="text-indigo-900">{formData.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
