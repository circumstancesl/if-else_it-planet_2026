import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleOption from "../../components/login/RoleOption.jsx";
import "./Auth.css";

export default function Login() {
    const [role, setRole] = useState("jobseeker");
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/");
    };

    const handleLogin = () => {
        switch(role) {
            case "jobseeker":
                navigate("/candidate-login");
                break;
            case "employer":
                navigate("/employer-login");
                break;
            case "curator":
                navigate("/curator-login");
                break;
            default:
                navigate("/candidate-login");
        }
    };

    const handleRegister = () => {
        switch(role) {
            case "jobseeker":
                navigate("/candidate-register");
                break;
            case "employer":
                navigate("/employer-register");
                break;
            default:
                navigate("/candidate-register");
        }
    };

    // Проверяем, нужно ли показывать кнопку регистрации
    const showRegisterButton = role !== "curator";

    return (
        <div className="login-page">
            <div className="overlay" />

            <div className="login-card">
                <div className="login-card-header">
                    <span className="back" onClick={handleBack}>←</span>
                    <h2>Вход</h2>
                    <div className="placeholder" />
                </div>

                <RoleOption
                    title="Я ищу работу"
                    subtitle="Профиль соискателя"
                    role="jobseeker"
                    selected={role === "jobseeker"}
                    onClick={() => setRole("jobseeker")}
                />

                <RoleOption
                    title="Я ищу молодых специалистов"
                    subtitle="Профиль работодателя"
                    role="employer"
                    selected={role === "employer"}
                    onClick={() => setRole("employer")}
                />

                <RoleOption
                    title="Я помогаю"
                    subtitle="Профиль куратора"
                    role="curator"
                    selected={role === "curator"}
                    onClick={() => setRole("curator")}
                />

                <div className="buttons-container">
                    <button className="primary" onClick={handleLogin}>Вход</button>
                    <div className="register-wrapper">
                        {showRegisterButton && (
                            <button className="secondary" onClick={handleRegister}>Регистрация</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}