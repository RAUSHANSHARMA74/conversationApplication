import {useEffect} from "react";
import "./Login.css";

// const url = "http://localhost:3571"
const url = "https://conversationbackend.onrender.com";


function Login() {

  const googleLoginHandler = () => {
    window.location.href = `${url}/auth/google`;
  };
  const githubLoginHandler = () => {
    window.location.href = `${url}/auth/github`
  };
  
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.location.href = "/"; 
    }else{
      const fetchData = async () => {
        try {
          const response = await fetch(`${url}/userDetail`, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": localStorage.getItem("token")
              }
          });
          if (response.ok) {
              const data = await response.json();
              let userDetail = data.userDetail;
             if(userDetail._id){
              window.location.href = "/"; 
             }
          } 
      } catch (error) {
          console.log("Something error in fetching user detail:");
          console.log(error);
      }
    };
    fetchData();
    }
  }, []);
  
  return (
    <div className="userLoginPage">
      <h1 className="pageTitle">Welcome to our Conversation Website</h1>
      <div className="loginButton">
        <button className="loginBtn" onClick={googleLoginHandler}>Google Login</button>
        <button className="loginBtn" onClick={githubLoginHandler}>Github Login</button>
      </div>
    </div>
  );
}

export default Login;
