import { useState } from "react";
import toast from "../../utils/toast.js";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast("Please fill all the fields", "warning");
      setLoading(false);
      return;
    }

    try{
      const config = {
        headers: { "Content-type": "application/json" },
      };

      // إعداد البيانات
      const userData = { email, password };
      
      console.log("Sending data:", userData);

      const { data } = await axios.post(
        "http://localhost:5000/api/user/login",
        userData,
        config
      ); 
      localStorage.setItem("user-info", JSON.stringify(data));
      console.log("user-info : "+ JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
      toast("login success", "success");
    }catch(error){
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
  return (
    <>
      <div className="form-group">
        <label htmlFor="email">
          email adress <span className="required">*</span>
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          placeholder="enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {/* / */}
      <div className="form-group">
        <label htmlFor="password">
          password <span className="required">*</span>
        </label>
        <div className="password-input">
          <input
            type={showPassword === true ? "text" : "password"}
            name="password"
            id="password"
            value={password}
            placeholder="enter your password"
                        onChange={(e) => setPassword(e.target.value)}

            required
          />
          <span
            className="show-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
            
          </span>
        </div>
      </div>
      {/* <div className="remember-forgot">
          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">تذكرني</label>
          </div>
          <a href="#" className="forgot-password">
            نسيت كلمة المرور؟
          </a>
        </div> */}
      <button className="primary-btn" disabled={loading} onClick={submitHandler}
        style={{
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}>
        
      {loading ? "loding..."  : "Login"}
      </button>
      <button className="danger-btn mt-2" 
      onClick={() => {
      setEmail("guest@example.com");
      setPassword("123456");
}}>
  Get Gust User Credentials</button>
      {/* <div className="register-link">
          ليس لديك حساب؟ <a href="#">سجل الآن</a>
        </div> */}
    </>
  );
};
export default Login;