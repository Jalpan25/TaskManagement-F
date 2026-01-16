const Profile = ({ data }) => {
  const { name, email, role, createdAt } = data;

  return (
    <div className="absolute top-12 right-0 w-64 bg-white text-gray-800 rounded-md shadow-lg p-4 z-50">
      <h2 className="text-sm font-semibold mb-2">Profile</h2>

      <div className="text-sm space-y-1">
        <p><span className="font-medium">Name:</span> {name}</p>
        <p><span className="font-medium">Email:</span> {email}</p>
        <p><span className="font-medium">Role:</span> {role}</p>
        <p className="text-xs text-gray-500">
          Joined: {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default Profile;
