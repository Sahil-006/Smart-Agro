import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/authContext"; // update path if needed

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    console.log("GitHub Callback Triggered. Code:", code); 

    if (error) {
      alert("GitHub login cancelled.");
      navigate("/login");
      return;
    }

    if (!code) {
      alert("No authorization code returned from GitHub.");
      navigate("/login");
      return;
    }

    axios.post("http://localhost:5000/github-login", { code }, { withCredentials: true })
      .then(res => {
        alert(res.data.message);
        setUser(res.data.user); // Assuming backend returns user data
        setIsAuthenticated(true);
        navigate("/dashboard");
      })
      .catch(err => {
        alert("GitHub login failed");
        navigate("/login");
      });
  }, [searchParams, navigate, setUser, setIsAuthenticated]);

  return <p>Logging in with GitHub...</p>;
};

export default GitHubCallback;
