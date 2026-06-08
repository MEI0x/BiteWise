import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "⚠️ WARNING: Are you absolutely sure you want to delete your BiteWise account? This action is permanent and will instantly wipe all your custom shopping registries."
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch("http://localhost:5000/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Send your saved JWT auth token inside the headers
          "token": localStorage.getItem("token") 
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        localStorage.removeItem("token"); // Clear current invalid session token
        navigate("/login"); // Redirect user out to login screen
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("Deletion error:", err);
      alert("Network connection failure. Try again later.");
    }
  };

  return (
    <div style={{ border: "1px solid #ff4d4d", padding: "20px", borderRadius: "8px", marginTop: "30px" }}>
      <h3 style={{ color: "#ff4d4d" }}>Danger Zone</h3>
      <p>Permanently remove your profile registry data and access tokens from BiteWise servers.</p>
      <button 
        onClick={handleDeleteAccount}
        style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "10px 15px", borderRadius: "5px", cursor: "pointer" }}
      >
        Delete Account
      </button>
    </div>
  );
};

export default AccountSettings;