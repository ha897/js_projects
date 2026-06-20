import Login from "../components/Authentication/Login";
import { useState, useEffect } from "react";
import Singnup from "../components/Authentication/Singnup";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [authenticationBtn, setAuthenticationBtn] = useState(0);
    const navigate = useNavigate();
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user-info"));

    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <div className="authentication-container">
      {/* <h1>log</h1> */}
      <div className="authentication-type">
        <button
          onClick={() => setAuthenticationBtn(0)}
          className={authenticationBtn === 0 ? "active" : ""}
        >
          Login
        </button>
        <button
          onClick={() => setAuthenticationBtn(1)}
          className={authenticationBtn === 1 ? "active" : ""}
        >
          Sing Up
        </button>
      </div>
      {authenticationBtn === 0 ? <Login /> : <Singnup />}
    </div>
  );
};
export default HomePage;
