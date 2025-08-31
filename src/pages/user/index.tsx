import { useAuth } from "../../stores";

const User = () => {
  const { user } = useAuth();
  console.log(user);
  return (
    <div>
      <h1>User Information</h1>
      {user ? (
        <div>
          <p>
            <strong>Username:</strong> {user?.username}
          </p>
          <p>
            <strong>Role:</strong> {user?.role}
          </p>
          {/* Add more user details as needed */}
        </div>
      ) : (
        <p>No user information available.</p>
      )}
    </div>
  );
};

export default User;
