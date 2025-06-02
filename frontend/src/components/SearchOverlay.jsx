// frontend/src/components/SearchOverlay.jsx
import React, { Component } from 'react';
import axios from 'axios';
import '../SearchOverlay.css';
// import { Link } from 'react-router-dom'; // 상세 페이지 링크 시 필요
import { withTranslation } from 'react-i18next';

const MAX_RECENT_SEARCHES = 10;

class SearchOverlay extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQuery: "",
            searchResults: [],
            searchLoading: false,
            searchError: null,
            hasPerformedSearch: false,
            recentSearches: [],
            isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
            userName: localStorage.getItem("isLoggedIn") === "true" ? localStorage.getItem("userName") || "" : "",
        };
        this.searchInputRef = React.createRef();
    }

    initializeSearchState = () => {
        this.setState({
            searchQuery: "",
            searchResults: [],
            hasPerformedSearch: false,
            searchError: null,
        });
        this.loadRecentSearches();
    }

    componentDidMount() {
        if (this.props.isOpen) {
            this.initializeSearchState();
            if (this.searchInputRef.current) {
                this.searchInputRef.current.focus();
            }
        }
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('storage', this.handleStorageChangeForOverlay);
    }

    componentDidUpdate(prevProps) {
        if (this.props.isOpen && !prevProps.isOpen) {
            this.initializeSearchState();
            if (this.searchInputRef.current) {
                this.searchInputRef.current.focus();
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('storage', this.handleStorageChangeForOverlay);
    }

    handleStorageChangeForOverlay = (event) => {
        if (event.key === 'isLoggedIn' || event.key === 'userName') {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
            const userName = isLoggedIn ? localStorage.getItem("userName") || "" : "";
            this.setState({ isLoggedIn, userName }, () => {
                this.loadRecentSearches();
            });
        }
    };

    handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            this.props.onClose();
        }
    };

    loadRecentSearches = () => {
        if (this.state.isLoggedIn && this.state.userName) {
            const storedSearches = localStorage.getItem(`recentSearches_${this.state.userName}`);
            this.setState({ recentSearches: storedSearches ? JSON.parse(storedSearches) : [] });
        } else {
            this.setState({ recentSearches: [] });
        }
    };

    addRecentSearch = (keyword) => {
        if (!keyword || !this.state.isLoggedIn || !this.state.userName) return;
        this.setState(prevState => {
            let updatedSearches = [keyword, ...prevState.recentSearches.filter(s => s.toLowerCase() !== keyword.toLowerCase())];
            if (updatedSearches.length > MAX_RECENT_SEARCHES) {
                updatedSearches = updatedSearches.slice(0, MAX_RECENT_SEARCHES);
            }
            localStorage.setItem(`recentSearches_${prevState.userName}`, JSON.stringify(updatedSearches));
            return { recentSearches: updatedSearches };
        });
    };

    deleteRecentSearch = (keywordToDelete, e) => {
        e.stopPropagation();
        if (!this.state.isLoggedIn || !this.state.userName) return;
        this.setState(prevState => {
            const updatedSearches = prevState.recentSearches.filter(s => s !== keywordToDelete);
            localStorage.setItem(`recentSearches_${prevState.userName}`, JSON.stringify(updatedSearches));
            return { recentSearches: updatedSearches };
        });
    };

    handleClearAllRecentSearches = () => {
        const { t } = this.props;
        if (!this.state.isLoggedIn || !this.state.userName) return;
        if (window.confirm(t('confirm_clear_recent_searches'))) {
            localStorage.removeItem(`recentSearches_${this.state.userName}`);
            this.setState({ recentSearches: [] });
        }
    };

    handleRecentSearchClick = (keyword) => {
        this.setState({ searchQuery: keyword }, () => {
            this.executeSearch(keyword);
        });
    };

    handleSearchInputChange = (e) => {
        const newQuery = e.target.value;
        this.setState({ searchQuery: newQuery });

        if (newQuery.trim() === "") {
            this.setState({
                searchError: null,
                hasPerformedSearch: false,
            });
        }
    };

    executeSearch = async (queryToSearch) => {
        const { t } = this.props;
        const trimmedQuery = queryToSearch ? queryToSearch.trim() : "";

        if (!trimmedQuery) {
            this.setState({
                searchResults: [],
                searchLoading: false,
                searchError: null,
                hasPerformedSearch: false
            });
            return;
        }

        this.setState({ searchLoading: true, searchError: null, hasPerformedSearch: true });
        try {
            const params = new URLSearchParams();
            params.append('keyword', trimmedQuery);
            const response = await axios.get(`http://localhost:5000/api/festivals?${params.toString()}`);
            const festivalsData = response.data.festivals || [];
            this.setState({ searchResults: festivalsData, searchLoading: false });

            if (this.state.isLoggedIn && this.state.userName && trimmedQuery) {
                this.addRecentSearch(trimmedQuery);
            }
        } catch (err) {
            this.setState({ searchError: t('error_searching'), searchResults: [], searchLoading: false });
        }
    };

    handleSearchSubmit = (e) => {
        e.preventDefault();
        this.executeSearch(this.state.searchQuery);
        if (this.searchInputRef.current) {
            this.searchInputRef.current.blur();
        }
    };

    handleResultItemClick = (festival) => {
        if (this.props.onClose) {
            this.props.onClose();
        }
        // 상세 페이지 이동 로직 (필요시 추가)
    };

    render() {
        const { t } = this.props;
        if (!this.props.isOpen) {
            return null;
        }

        const {
            searchQuery, searchResults, searchLoading, searchError, hasPerformedSearch, recentSearches, isLoggedIn
        } = this.state;

        const showRecentSearches = isLoggedIn && recentSearches.length > 0;
        const showNoResultsMessage = !searchLoading && !searchError && hasPerformedSearch && searchQuery.trim() !== "" && searchResults.length === 0;

        return (
            <div className="search-overlay-backdrop" onClick={this.props.onClose}>
                <div className="search-overlay-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button" onClick={this.props.onClose} aria-label={t('close_overlay_aria_label')}>×</button>

                    <div className="search-overlay-header">
                        <form onSubmit={this.handleSearchSubmit} className="search-overlay-form">
                            <input
                                ref={this.searchInputRef}
                                type="search"
                                className="search-overlay-input"
                                placeholder={t('search_placeholder_overlay')}
                                value={searchQuery}
                                onChange={this.handleSearchInputChange}
                                aria-label={t('search_input_aria_label')}
                            />
                            <button type="submit" className="search-overlay-button" aria-label={t('execute_search_aria_label')}>{t('search_button_text')}</button>
                        </form>
                    </div>

                    {showNoResultsMessage && (
                        <p className="message-feedback info">{t('no_results_for_query', { query: searchQuery })}</p>
                    )}

                    {showRecentSearches && (
                        <div className="search-overlay-recent-searches">
                            <div className="recent-searches-header">
                                <h4>{t('recent_searches')}</h4>
                                {recentSearches.length > 0 && (
                                    <button onClick={this.handleClearAllRecentSearches} className="clear-all-button">
                                        {t('clear_all')}
                                    </button>
                                )}
                            </div>
                            <ul>
                                {recentSearches.map((term, index) => (
                                    <li key={`${term}-${index}`} onClick={() => this.handleRecentSearchClick(term)} title={t('search_with_term_title', { term: term })}>
                                        <span>{term}</span>
                                        <button
                                            className="delete-button"
                                            onClick={(e) => this.deleteRecentSearch(term, e)}
                                            aria-label={t('delete_recent_search_aria_label', { term: term })}
                                        >×</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {(searchLoading || searchError || (hasPerformedSearch && searchResults.length > 0)) && (
                        <div className="search-overlay-results-area">
                            {searchLoading && <p className="message-feedback loading">{t('loading_results')}</p>}
                            {searchError && <p className="message-feedback error">{t('error_searching')}</p>}

                            {!searchLoading && !searchError && searchResults.length > 0 && (
                                <>
                                    <h3>{t('search_results_count', { query: searchQuery, count: searchResults.length })}</h3>
                                    <div className="results-list">
                                        {searchResults.map((festival) => (
                                            <div className="result-item" key={festival['축제일련번호'] || festival['축제명']} onClick={() => this.handleResultItemClick(festival)}>
                                                <h4>{festival['축제명']}</h4> {/* 축제명은 동적 데이터 */}
                                                {festival['개최장소'] && <p className="location">📍 {festival['개최장소']}</p>}
                                                {(festival['축제시작일자'] && festival['축제종료일자']) &&
                                                    <p className="date">📅 {festival['축제시작일자']} ~ {festival['축제종료일자']}</p>
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default withTranslation()(SearchOverlay);