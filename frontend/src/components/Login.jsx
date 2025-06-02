// frontend/src/components/Login.jsx
import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import "../login.css";
import axios from "axios";
import NavBar from "./NavBar";
import { withTranslation } from 'react-i18next'; // HOC 추가

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            redirectToHome: false,
        };
    }

    handleInputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleLogin = (e) => {
        e.preventDefault();
        const { username, password } = this.state;
        const { t } = this.props; // t 함수 가져오기

        if (!username.trim() || !password.trim()) {
            alert(t('login_alert_fill_all'));
            return;
        }

        axios
            .post("http://localhost:5000/login", { username, password })
            .then((res) => {
                if (res.data.result === "success") {
                    localStorage.setItem("token", res.data.token);
                    localStorage.setItem("userName", res.data.userName);
                    localStorage.setItem("isLoggedIn", "true");
                    if (res.data.name) {
                        localStorage.setItem("name", res.data.name);
                    }
                    if (res.data.interests && Array.isArray(res.data.interests)) {
                        localStorage.setItem("interests", JSON.stringify(res.data.interests));
                    } else {
                        localStorage.setItem("interests", JSON.stringify([]));
                    }
                    this.setState({ redirectToHome: true });
                } else {
                    alert(t('login_alert_failed', { message: (res.data.message || t('login_alert_failed_default')) }));
                }
            })
            .catch((err) => {
                console.error("Login API error:", err);
                let errorMessage = t('login_alert_error');
                if (err.response && err.response.data) {
                    errorMessage = err.response.data.error || err.response.data.message || errorMessage;
                } else if (err.request) {
                    errorMessage = t('login_alert_server_no_response');
                }
                alert(errorMessage);
            });
    };

    render() {
        const { t, toggleSearchOverlay } = this.props; // t 함수와 toggleSearchOverlay(App.js에서 전달) 가져오기

        if (this.state.redirectToHome) {
            return <Navigate to="/" replace />;
        }

        return (
            <>
                
                <div className="login-body">
                    <div className="login-container">
                        <h2 className="login-title">{t('login_title')}</h2>
                        <form onSubmit={this.handleLogin} className="login-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="username"
                                    placeholder={t('login_id_placeholder')}
                                    value={this.state.username}
                                    onChange={this.handleInputChange}
                                    className="form-input"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder={t('login_password_placeholder')}
                                    value={this.state.password}
                                    onChange={this.handleInputChange}
                                    className="form-input"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            <button type="submit" className="login-button">{t('login_button')}</button>
                        </form>

                        <div className="social-login">
                            <p className="social-title">{t('login_simple_login_title')}</p>
                            <div className="social-icons">
                                <a href="#!" onClick={(e) => { e.preventDefault(); alert(t('naver_login_coming_soon', '네이버 로그인 기능은 준비중입니다.')); }} className="social-icon-link"> {/* 키 추가 필요 */}
                                    <img src="/images/naver.png" alt={t('login_naver_alt')} className="social-icon" />
                                </a>
                                <a href="#!" onClick={(e) => { e.preventDefault(); alert(t('kakao_login_coming_soon', '카카오 로그인 기능은 준비중입니다.')); }} className="social-icon-link"> {/* 키 추가 필요 */}
                                    <img src="/images/kakao-talk.png" alt={t('login_kakao_alt')} className="social-icon" />
                                </a>
                            </div>
                        </div>

                        <div className="login-links" style={{ marginTop: '20px', textAlign: 'center' }}>
                            <Link to="/signup" className="link" style={{ marginRight: '20px' }}>{t('nav_signup')}</Link>
                            <Link to="/find-account" className="link">{t('nav_find_account')}</Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default withTranslation()(Login); // withTranslation으로 감싸기