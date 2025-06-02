import React, { Component } from "react";
import '../register.css';
import axios from "axios";
//import NavBar from "./NavBar";
import { Navigate, Link } from "react-router-dom";
import { withTranslation } from 'react-i18next'; // 다국어 HOC
import i18n from '../i18n'; // ✅ i18n 직접 import 추가 (오류 해결)

// 관심사 목록 (추후 다국어 키와 매핑 필요 시 확장 가능)
const interestOptions = ["음악", "음식", "전통문화", "연극", "야시장", "전통", "야간", "콘서트", "한복"];

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            phoneNumber: '',
            username: '',
            password: '',
            confirmPassword: '',
            interests: [],
            nameError: '',
            phoneNumberError: '',
            passwordError: '',
            registrationSuccess: false,
        };
    }

    handleInterestChange = (e) => {
        const { value, checked } = e.target;
        this.setState(prevState => {
            const newInterests = checked
                ? [...prevState.interests, value]
                : prevState.interests.filter(item => item !== value);
            return { interests: newInterests };
        });
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        const { t } = this.props;

        this.setState({ [name]: value }, () => {
            if (name === "name") {
                const nameRegex = /^[가-힣]{2,}$/;
                if (value.trim() && !nameRegex.test(value.trim()) && i18n.language === 'ko') {
                    this.setState({ nameError: t('validate_name_format') });
                } else if (!value.trim()) {
                    this.setState({ nameError: t('validate_name_empty') });
                } else {
                    this.setState({ nameError: "" });
                }
            }
            if (name === "phoneNumber") {
                const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
                if (value.trim() && !phoneRegex.test(value.trim())) {
                    this.setState({ phoneNumberError: t('validate_phone_format') });
                } else {
                    this.setState({ phoneNumberError: "" });
                }
            }
            if (name === "password" || name === "confirmPassword") {
                const { password, confirmPassword } = this.state;
                if (password && confirmPassword && password !== confirmPassword) {
                    this.setState({ passwordError: t('validate_password_mismatch') });
                } else {
                    this.setState({ passwordError: "" });
                }
            }
        });
    }

    callRegisterAPI = () => {
        const { name, phoneNumber, username, password, interests } = this.state;
        const userData = {
            name: name.trim(),
            phoneNumber: phoneNumber.trim(),
            username: username.trim(),
            password: password,
            interests: interests
        };
        return axios.post('http://localhost:5000/reg_ok', userData);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { t } = this.props;
        const { name, phoneNumber, username, password, confirmPassword, interests, nameError, phoneNumberError, passwordError } = this.state;

        if (!name.trim() || !phoneNumber.trim() || !username.trim() || !password || !confirmPassword) {
            alert(t('register_alert_fill_all'));
            return;
        }
        if (nameError || phoneNumberError || passwordError) {
            alert(t('register_alert_check_format'));
            return;
        }
        if (interests.length === 0) {
            alert(t('register_alert_select_interest'));
            return;
        }

        this.callRegisterAPI()
            .then((response) => {
                if (response.data && response.data.result === 'success') {
                    alert(t('register_alert_success'));
                    this.setState({ registrationSuccess: true });
                } else {
                    const errorMessage = response.data?.message || response.data?.error || 'Unknown registration failure';
                    alert(t('register_alert_failed', { message: errorMessage }));
                }
            })
            .catch((error) => {
                console.error("Registration API call error:", error.response || error.message);
                let alertMessage = t('register_alert_error');
                if (error.response && error.response.data) {
                    alertMessage = t('register_alert_failed', {
                        message: (error.response.data.error || error.response.data.message || 'Server response error')
                    });
                }
                alert(alertMessage);
            });
    }

    render() {
        const { t } = this.props;

        if (this.state.registrationSuccess) {
            return <Navigate to="/login" replace />;
        }

        return (
            <>
                <div className="login-body">
                    <div className="login-container">
                        <h2>{t('register_title')}</h2>
                        <form onSubmit={this.handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="name">{t('register_name_label')}</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder={t('register_name_placeholder')}
                                    value={this.state.name}
                                    onChange={this.handleInputChange}
                                    required
                                />
                                {this.state.nameError && (
                                    <p className="error-message" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                                        {this.state.nameError}
                                    </p>
                                )}
                            </div>

                            <div className="input-group">
                                <label htmlFor="phoneNumber">{t('register_phone_label')}</label>
                                <input
                                    type="text"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    placeholder={t('register_phone_placeholder')}
                                    value={this.state.phoneNumber}
                                    onChange={this.handleInputChange}
                                    title={t('validate_phone_format')}
                                    required
                                />
                                {this.state.phoneNumberError && (
                                    <p className="error-message" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                                        {this.state.phoneNumberError}
                                    </p>
                                )}
                            </div>

                            <div className="input-group">
                                <label htmlFor="username">{t('register_id_label')}</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder={t('register_id_placeholder')}
                                    value={this.state.username}
                                    onChange={this.handleInputChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="password">{t('register_password_label')}</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder={t('register_password_placeholder')}
                                    value={this.state.password}
                                    onChange={this.handleInputChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="confirmPassword">{t('register_confirm_password_label')}</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder={t('register_confirm_password_placeholder')}
                                    value={this.state.confirmPassword}
                                    onChange={this.handleInputChange}
                                    required
                                />
                                {this.state.passwordError && (
                                    <p className="error-message" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px' }}>
                                        {this.state.passwordError}
                                    </p>
                                )}
                            </div>

                            <div className="input-group">
                                <label>{t('register_interests_label')}</label>
                                <div className="interest-checkboxes">
                                    {interestOptions.map((interest, index) => (
                                        <label key={index} className="interest-label" style={{ marginRight: '15px', display: 'inline-block' }}>
                                            <input
                                                type="checkbox"
                                                value={interest}
                                                checked={this.state.interests.includes(interest)}
                                                onChange={this.handleInterestChange}
                                                style={{ marginRight: '5px' }}
                                            />
                                            {interest}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <input type="submit" value={t('register_button')} className="btn-login" />
                        </form>
                        <Link className="link" to="/login" style={{ marginTop: '15px', display: 'inline-block' }}>{t('register_go_back_link')}</Link>
                    </div>
                </div>
            </>
        );
    }
}

const TranslatedRegister = withTranslation()(Register);
export default TranslatedRegister;
