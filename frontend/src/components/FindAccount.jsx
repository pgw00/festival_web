// frontend/src/components/FindAccount.jsx
import React, { Component } from 'react';
import axios from 'axios';
import NavBar from './NavBar';
import '../login.css'; // login.css 스타일 공유
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next'; // HOC 추가

class FindAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 'findId',
            nameForId: '',
            phoneNumberForId: '',
            foundId: '',
            findIdMessage: '',
            nameErrorForId: '',
            phoneErrorForId: '',
            usernameForPw: '',
            findPwMessage: '',
        };
    }

    resetFormStates = (isIdForm) => {
        if (isIdForm) {
            this.setState({
                nameForId: '',
                phoneNumberForId: '',
                foundId: '',
                findIdMessage: '',
                nameErrorForId: '',
                phoneErrorForId: '',
            });
        } else {
            this.setState({
                usernameForPw: '',
                findPwMessage: '',
            });
        }
    }

    handleTabChange = (tab) => {
        this.setState({ activeTab: tab }, () => {
            if (tab === 'findId') {
                this.resetFormStates(false);
            } else {
                this.resetFormStates(true);
            }
        });
    };

    validateName = (name) => {
        const { t } = this.props;
        const nameRegex = /^[가-힣]{2,}$/; // 한글 이름 기준, 다른 언어도 지원하려면 정규식 수정 필요
        if (!name.trim()) return t('validate_name_empty');
        if (!nameRegex.test(name.trim())) return t('validate_name_format'); // 현재 한국어 기준 메시지
        return "";
    };

    validatePhoneNumber = (phone) => {
        const { t } = this.props;
        const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/;
        if (!phone.trim()) return t('validate_phone_empty');
        if (!phoneRegex.test(phone.trim())) return t('validate_phone_format');
        return "";
    };

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });

        if (this.state.activeTab === 'findId') {
            if (name === "nameForId") {
                this.setState({ nameErrorForId: this.validateName(value) });
            } else if (name === "phoneNumberForId") {
                this.setState({ phoneErrorForId: this.validatePhoneNumber(value) });
            }
        }
        if (name === "nameForId" || name === "phoneNumberForId") {
            this.setState({ findIdMessage: '', foundId: '' });
        }
        if (name === "usernameForPw") {
            this.setState({ findPwMessage: '' });
        }
    };

    handleFindId = async (e) => {
        e.preventDefault();
        const { nameForId, phoneNumberForId } = this.state;
        const { t } = this.props;

        const nameErr = this.validateName(nameForId);
        const phoneErr = this.validatePhoneNumber(phoneNumberForId);

        this.setState({
            nameErrorForId: nameErr,
            phoneErrorForId: phoneErr,
            findIdMessage: '',
            foundId: ''
        });

        if (nameErr || phoneErr) return;

        try {
            const response = await axios.post('http://localhost:5000/api/find-id', {
                name: nameForId.trim(),
                phoneNumber: phoneNumberForId.trim(),
            });
            if (response.data && response.data.username) {
                this.setState({ foundId: response.data.username, findIdMessage: t('find_id_found_message') });
            } else {
                this.setState({ findIdMessage: response.data.message || t('find_id_not_found_message') });
            }
        } catch (error) {
            console.error("Error finding ID:", error.response || error.message);
            this.setState({ findIdMessage: error.response?.data?.message || error.response?.data?.error || t('find_id_error_message') });
        }
    };

    handleFindPassword = async (e) => {
        e.preventDefault();
        const { usernameForPw } = this.state;
        const { t } = this.props;
        this.setState({ findPwMessage: '' });

        if (!usernameForPw.trim()) {
            this.setState({ findPwMessage: t('validate_id_empty') });
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/find-pw', {
                username: usernameForPw.trim(),
            });
            if (response.data && response.data.message) {
                this.setState({ findPwMessage: response.data.message }); // 서버 메시지를 그대로 사용하거나, t()로 번역
            } else if (response.data && response.data.password) { // 💥 보안 위험 부분
                this.setState({ findPwMessage: t('find_pw_message_temp_pw_received') });
            }
            else {
                this.setState({ findPwMessage: t('find_pw_not_found_message') });
            }
        } catch (error) {
            console.error("Error finding password:", error.response || error.message);
            this.setState({ findPwMessage: error.response?.data?.message || error.response?.data?.error || t('find_pw_error_message') });
        }
    };

    renderFindIdForm() {
        const { nameForId, phoneNumberForId, nameErrorForId, phoneErrorForId, findIdMessage, foundId } = this.state;
        const { t } = this.props;
        return (
            <form onSubmit={this.handleFindId}>
                <div className="input-group">
                    <label htmlFor="nameForIdInput">{t('find_account_name_label')}</label>
                    <input type="text" id="nameForIdInput" name="nameForId" placeholder={t('find_account_name_placeholder')}
                        value={nameForId} onChange={this.handleChange} required />
                    {nameErrorForId && <p className="error-message" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px', marginBottom: '0px' }}>{nameErrorForId}</p>}
                </div>
                <div className="input-group">
                    <label htmlFor="phoneNumberForIdInput">{t('find_account_phone_label')}</label>
                    <input type="text" id="phoneNumberForIdInput" name="phoneNumberForId" placeholder={t('find_account_phone_placeholder')}
                        value={phoneNumberForId} onChange={this.handleChange} required />
                    {phoneErrorForId && <p className="error-message" style={{ color: 'red', fontSize: '0.9em', marginTop: '5px', marginBottom: '0px' }}>{phoneErrorForId}</p>}
                </div>
                <button type="submit" className="btn-login">{t('find_id_button')}</button>
                {findIdMessage && (
                    <p style={{ marginTop: '15px', color: foundId ? 'blue' : 'red', fontWeight: 'bold' }}>
                        {findIdMessage}
                        {foundId && <span style={{ display: 'block', marginTop: '5px' }}> {t('find_account_id_label')}: <strong>{foundId}</strong></span>}
                    </p>
                )}
            </form>
        );
    }

    renderFindPasswordForm() {
        const { usernameForPw, findPwMessage } = this.state;
        const { t } = this.props;
        return (
            <form onSubmit={this.handleFindPassword}>
                <div className="input-group">
                    <label htmlFor="usernameForPwInput">{t('find_account_id_label')}</label>
                    <input type="text" id="usernameForPwInput" name="usernameForPw" placeholder={t('find_account_id_placeholder')}
                        value={usernameForPw} onChange={this.handleChange} required />
                </div>
                <button type="submit" className="btn-login">{t('find_password_button')}</button>
                {findPwMessage && (
                    <p style={{ marginTop: '15px', color: findPwMessage.includes(t('find_pw_guidance_substring', "발송")) || findPwMessage.includes(t('find_pw_guidance_substring', "안내")) ? 'blue' : 'red', fontWeight: 'bold' }}> {/* "발송" 또는 "안내" 포함 시 파란색 */}
                        {findPwMessage}
                    </p>
                )}
            </form>
        );
    }

    render() {
        const { activeTab } = this.state;
        const { t, toggleSearchOverlay } = this.props; // toggleSearchOverlay 추가
        return (
            <>
                
                <div className="login-body">
                    <div className="login-container" style={{ minHeight: '480px' }}>
                        <h2>{t('find_account_title')}</h2>
                        <div className="find-account-tabs" style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <button
                                onClick={() => this.handleTabChange('findId')}
                                className={`tab-btn ${activeTab === 'findId' ? 'active' : ''}`}
                                style={{ padding: '10px 15px', marginRight: '10px', cursor: 'pointer', border: activeTab === 'findId' ? '2px solid #007bff' : '1px solid #ccc', borderRadius: '5px' }}
                            >
                                {t('find_id_tab')}
                            </button>
                            <button
                                onClick={() => this.handleTabChange('findPw')}
                                className={`tab-btn ${activeTab === 'findPw' ? 'active' : ''}`}
                                style={{ padding: '10px 15px', cursor: 'pointer', border: activeTab === 'findPw' ? '2px solid #007bff' : '1px solid #ccc', borderRadius: '5px' }}
                            >
                                {t('find_password_tab')}
                            </button>
                        </div>

                        {activeTab === 'findId' ? this.renderFindIdForm() : this.renderFindPasswordForm()}

                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <Link className="link" to="/login" >{t('find_account_go_to_login_link')}</Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default withTranslation()(FindAccount); // withTranslation으로 감싸기