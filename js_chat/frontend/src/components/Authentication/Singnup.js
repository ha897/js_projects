import { useState } from "react";
import { useNavigate } from 'react-router-dom';

import toast from "../../utils/toast.js";
import axios from "axios";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const navigate = useNavigate();
  
  const submitHandler = async () => {
    console.log("=== SUBMIT DATA ===")
    console.log("Name:", name)
    console.log("Email:", email)
    console.log("Password:", password)
    console.log("Confirm Password:", confirmpassword)
    console.log("Pic URL:", pic)
    console.log("==================")
    
    setLoading(true);

    if (!name || !email || !password || !confirmpassword) {
      toast("Please fill all the fields", "warning");
      setLoading(false);
      return;
    }

    if (password !== confirmpassword) {
      toast("Passwords Do Not Match", "warning");
      setLoading(false);
      return;
    }

    // تحقق من أن رفع الصورة انتهى
    if (imageLoading) {
      toast("Please wait for image upload to complete", "warning");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: { "Content-type": "application/json" },
      };

      // إعداد البيانات
      const userData = { name, email, password };
      
      // أضف الصورة فقط إذا كانت موجودة
      if (pic && pic.trim() !== "") {
        userData.pic = pic;
      }

      console.log("Sending data:", userData);

      const { data } = await axios.post(
        "http://localhost:5000/api/user",
        userData,
        config
      ); 

      console.log("Server response:", data);
      toast("Registration success", "success");
      localStorage.setItem("user-info", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
      
    } catch (error) {
      console.log("=== ERROR DETAILS ===");
      console.log("Full error object:", error);
      console.log("Error response:", error.response);
      console.log("Error request:", error.request);
      console.log("Error message:", error.message);
      console.log("====================");
      
      let errorMessage = "Registration failed";
      
      if (error.response) {
        // السرفر رد برد خطأ
        errorMessage = error.response.data?.message || `Server Error: ${error.response.status}`;
        console.log("Server error data:", error.response.data);
      } else if (error.request) {
        // الطلب تم إرساله لكن لم يرد السرفر
        errorMessage = "No response from server. Check if backend is running on port 5000";
        console.log("No response from server");
      } else {
        // خطأ في إعداد الطلب
        errorMessage = `Request Error: ${error.message}`;
      }
      
      toast(errorMessage, "error");
      setLoading(false);
    }
  };

  const postDetails = (pics) => {
    if (!pics) {
      toast("Please select an image", "warning");
      return;
    }

    console.log("Selected file:", pics);
    console.log("File type:", pics.type);
    console.log("File size:", pics.size);

    if (pics.type !== "image/jpeg" && pics.type !== "image/png") {
      toast("Please select a JPEG or PNG image", "warning");
      return;
    }

    // تحقق من حجم الملف (10MB max)
    if (pics.size > 10 * 1024 * 1024) {
      toast("Image size should be less than 10MB", "warning");
      return;
    }

    setImageLoading(true);
    
    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", "chat-app-preset");
    data.append("cloud_name", "djg4tke7h");

    console.log("Starting upload to Cloudinary...");

    fetch("https://api.cloudinary.com/v1_1/djg4tke7h/image/upload", {
      method: "POST",
      body: data,
    })
      .then((res) => {
        console.log("Cloudinary response status:", res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        return res.json();
      })
      .then((data) => {
        console.log("Cloudinary response data:", data);
        
        if (data.secure_url) {
          setPic(data.secure_url);
          console.log("Image URL set to:", data.secure_url);
          toast("Image uploaded successfully", "success");
        } else if (data.url) {
          setPic(data.url);
          console.log("Image URL set to:", data.url);
          toast("Image uploaded successfully", "success");
        } else {
          console.error("No URL in Cloudinary response:", data);
          throw new Error("No image URL returned from Cloudinary");
        }
        
        setImageLoading(false);
      })
      .catch((err) => {
        console.error("Cloudinary upload error:", err);
        toast("Image upload failed. Please try again.", "error");
        setImageLoading(false);
        setPic(""); // إعادة تعيين الصورة عند الفشل
      });
  };

  return (
    <>
      <div className="form-group">
        <label htmlFor="name">Name <span className="required">*</span></label>
        <input 
          id="name" 
          placeholder="Enter your name" 
          value={name}
          onChange={(e) => setName(e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email address <span className="required">*</span></label>
        <input 
          type="email" 
          id="email" 
          placeholder="Enter your email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password <span className="required">*</span></label>
        <div className="password-input">
          <input 
            type={showPassword ? "text" : "password"} 
            id="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <span className="show-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirm-password">Confirm password <span className="required">*</span></label>
        <div className="password-input">
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            id="confirm-password" 
            placeholder="Confirm your password" 
            value={confirmpassword}
            onChange={(e) => setConfirmpassword(e.target.value)} 
            required 
          />
          <span className="show-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? "Hide" : "Show"}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>Upload your picture</label>
        <input 
          type="file" 
          accept="image/jpeg,image/png" 
          onChange={(e) => postDetails(e.target.files[0])} 
          disabled={imageLoading}
        />
        {imageLoading && <p style={{color: '#666', fontSize: '0.9em'}}>Uploading image...</p>}
        {pic && !imageLoading && <p style={{color: 'green', fontSize: '0.9em'}}>✓ Image uploaded successfully</p>}
      </div>

      <button 
        onClick={submitHandler} 
        className="primary-btn"
        disabled={loading || imageLoading}
        style={{
          opacity: loading || imageLoading ? 0.7 : 1,
          cursor: loading || imageLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? "Creating Account..." : imageLoading ? "Please wait..." : "Sign Up"}
      </button>
    </>
  );
};

export default Signup;