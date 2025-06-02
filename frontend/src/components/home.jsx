// frontend/src/components/home.jsx
import React, { Component } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../home.css"; // 이 CSS 파일을 아래 제공되는 전체 코드로 교체해주세요.
import { withTranslation } from 'react-i18next';
import {
    FaChevronLeft, FaChevronRight, FaTicketAlt, FaMapMarkedAlt, FaBullhorn,
    FaUsers, FaLightbulb, FaRegCalendarAlt, FaHandsHelping, FaInfoCircle,
    FaRegStar, FaPhotoVideo, FaComments, FaSearchLocation, FaPlaneDeparture
    // 필요한 다른 아이콘이 있다면 여기에 추가 (예: FaPalette, FaUtensils, FaMusic)
} from 'react-icons/fa';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
            userName: localStorage.getItem("isLoggedIn") === "true" ? (localStorage.getItem("userName") || "") : "",
            recommendations: [],
            loadingRecs: false,
            recError: null,
            currentSlide: 0,
            upcomingFestivals: [
                { id: 'uf1', nameKey: 'upcoming_festival_1_name', date: '2025.06.10 - 06.15', image: '/images/upcoming/upcoming1.jpg', link: '/festivals/detail/uf1', themeKey: 'summer_music', locationKey: 'upcoming_festival_1_location' },
                { id: 'uf2', nameKey: 'upcoming_festival_2_name', date: '2025.07.01 - 07.07', image: '/images/upcoming/upcoming2.jpg', link: '/festivals/detail/uf2', themeKey: 'food_festival', locationKey: 'upcoming_festival_2_location' },
                { id: 'uf3', nameKey: 'upcoming_festival_3_name', date: '2025.08.15 - 08.20', image: '/images/upcoming/upcoming3.jpg', link: '/festivals/detail/uf3', themeKey: 'traditional_culture', locationKey: 'upcoming_festival_3_location' },
                { id: 'uf4', nameKey: 'upcoming_festival_4_name', date: '2025.09.20 - 09.25', image: '/images/upcoming/upcoming4.jpg', link: '/festivals/detail/uf4', themeKey: 'art_culture', locationKey: 'upcoming_festival_4_location' }
            ],
            curationTabs: [
                { id: 'curation1', titleKey: 'home_curation_ai_title', descriptionKey: 'home_curation_ai_desc', icon: <FaLightbulb size={30} />, link: '/festivals?filter=ai_recommended', ctaKey: 'home_curation_cta_ai' },
                { id: 'curation2', titleKey: 'home_curation_hotspot_title', descriptionKey: 'home_curation_hotspot_desc', icon: <FaMapMarkedAlt size={30} />, link: '/regions', ctaKey: 'home_curation_cta_region' },
                { id: 'curation3', titleKey: 'home_curation_planner_title', descriptionKey: 'home_curation_planner_desc', icon: <FaRegCalendarAlt size={30} />, link: '/themes', ctaKey: 'home_curation_cta_theme' }
            ],
            serviceBanners: [
                { id: 'sb1', titleKey: 'home_service_banner_1_title', descriptionKey: 'home_service_banner_1_desc', image: '/images/service_banner_1.jpg', link: '/info/travel_tips' },
                { id: 'sb2', titleKey: 'home_service_banner_2_title', descriptionKey: 'home_service_banner_2_desc', image: '/images/service_banner_2.jpg', link: '/info/safety_guide' }
            ],
            communityHighlights: [
                { id: 'ch1', titleKey: 'community_highlight_1_title', author: '여행가다람쥐', link: '/community/post/ch1', typeKey: 'community_type_review', image: '/images/community/comm1.jpg', likes: 120 },
                { id: 'ch2', titleKey: 'community_highlight_2_title', author: '축제도장깨기', link: '/community/post/ch2', typeKey: 'community_type_tip', image: '/images/community/comm2.jpg', likes: 98 },
                { id: 'ch3', titleKey: 'community_highlight_3_title', author: '미식탐험가', link: '/community/post/ch3', typeKey: 'community_type_photo', image: '/images/community/comm3.jpg', likes: 250 },
                { id: 'ch4', titleKey: 'community_highlight_4_title', author: '나홀로여행족', link: '/community/post/ch4', typeKey: 'community_type_review', image: '/images/community/comm4.jpg', likes: 77 }
            ],
            featuredRegions: [
                { id: 'fr1', nameKey: 'featured_region_1_name', image: '/images/regions_featured/region1.jpg', link: '/region/부산광역시', descriptionKey: 'featured_region_1_desc' },
                { id: 'fr2', nameKey: 'featured_region_2_name', image: '/images/regions_featured/region2.jpg', link: '/region/제주특별자치도', descriptionKey: 'featured_region_2_desc' },
                { id: 'fr3', nameKey: 'featured_region_3_name', image: '/images/regions_featured/region3.jpg', link: '/region/서울특별시', descriptionKey: 'featured_region_3_desc' },
                { id: 'fr4', nameKey: 'featured_region_4_name', image: '/images/regions_featured/region4.jpg', link: '/region/경기도', descriptionKey: 'featured_region_4_desc' }
            ],
            travelTips: [
                { id: 'tip1', titleKey: 'travel_tip_1_title', summaryKey: 'travel_tip_1_summary', icon: <FaInfoCircle size={24} />, link: '/tips/tip1' },
                { id: 'tip2', titleKey: 'travel_tip_2_title', summaryKey: 'travel_tip_2_summary', icon: <FaPlaneDeparture size={24} />, link: '/tips/tip2' },
                { id: 'tip3', titleKey: 'travel_tip_3_title', summaryKey: 'travel_tip_3_summary', icon: <FaPhotoVideo size={24} />, link: '/tips/tip3' }
            ]
        };

        this.slides = [
            { image: "/images/slide1.jpg", title_key: "home_slide1_winter_title", desc_key: "home_slide1_winter_desc", buttonText_key: "slide_button_text", themeServerKey: "winter_snow" },
            { image: "/images/slide2.jpg", title_key: "home_slide2_summer_title", desc_key: "home_slide2_summer_desc", buttonText_key: "slide_button_text", themeServerKey: "summer_music" },
            { image: "/images/slide3.jpg", title_key: "home_slide3_tradition_title", desc_key: "home_slide3_tradition_desc", buttonText_key: "slide_button_text", themeServerKey: "traditional_culture" },
            { image: "/images/slide4.jpg", title_key: "home_slide4_food_title", desc_key: "home_slide4_food_desc", buttonText_key: "slide_button_text", themeServerKey: "food_festival" },
        ];
        this.slideInterval = null;
        this.nextSlide = this.nextSlide.bind(this);
        this.prevSlide = this.prevSlide.bind(this);
        this.goToSlide = this.goToSlide.bind(this);
    }

    // --- 생명주기 메서드 및 기존 로직들 ---
    loadLoginStatusAndRecommendations = () => {
        const savedLogin = localStorage.getItem("isLoggedIn") === "true";
        const savedUserName = savedLogin ? (localStorage.getItem("userName") || "") : "";
        this.setState({ isLoggedIn: savedLogin, userName: savedUserName }, () => {
            if (this.state.isLoggedIn && this.state.userName) {
                this.fetchRecommendations();
            } else {
                this.setState({ recommendations: [], recError: null, loadingRecs: false });
            }
        });
    }

    componentDidMount() {
        this.loadLoginStatusAndRecommendations();
        if (this.slides.length > 1) {
            this.slideInterval = setInterval(this.nextSlide, 7000);
        }
        window.addEventListener('storage', this.handleStorageChangeForHome);
    }

    componentWillUnmount() {
        if (this.slideInterval) clearInterval(this.slideInterval);
        window.removeEventListener('storage', this.handleStorageChangeForHome);
    }

    handleStorageChangeForHome = (event) => {
        if (event.key === 'isLoggedIn' || event.key === 'userName') {
            this.loadLoginStatusAndRecommendations();
        }
    };

    fetchRecommendations = () => {
        const { userName } = this.state;
        const { t } = this.props;
        if (!userName) return;
        this.setState({ loadingRecs: true, recError: null });
        axios
            .post("http://localhost:5000/recommend", { userId: userName })
            .then((res) => {
                this.setState({
                    recommendations: res.data.recommendations || [],
                    loadingRecs: false,
                    recError: (!res.data.recommendations || res.data.recommendations.length === 0) ? t('home_no_recommendations') : null,
                });
            })
            .catch((err) => {
                this.setState({
                    recError: t('error_searching'),
                    loadingRecs: false,
                    recommendations: [],
                });
            });
    };

    handleJobInfoClick = () => {
        const { t } = this.props;
        if (this.state.isLoggedIn) {
            alert(t('home_job_info_redirect_alert'));
        } else {
            alert(t('login_required_alert'));
        }
    };

    nextSlide = () => {
        this.setState(prev => ({
            currentSlide: (prev.currentSlide + 1) % this.slides.length,
        }));
    };

    prevSlide = () => {
        this.setState(prev => ({
            currentSlide: (prev.currentSlide - 1 + this.slides.length) % this.slides.length,
        }));
    };

    goToSlide = (index) => {
        this.setState({ currentSlide: index });
    };
    // --- 여기까지 ---

    render() {
        const { t } = this.props;
        const {
            isLoggedIn, recommendations, loadingRecs, recError, currentSlide,
            curationTabs, upcomingFestivals, serviceBanners, communityHighlights,
            featuredRegions, travelTips,
            userName
        } = this.state;

        const currentSlideData = this.slides.length > 0 ? this.slides[currentSlide] : null;

        return (
            <div className="home-page-container vibrant-theme">
                {/* 1. 상단 히어로 슬라이드 */}
                {currentSlideData && (
                    <section
                        className="hero-slider-section vibrant-hero"
                        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}${currentSlideData.image})` }}
                        aria-roledescription="carousel"
                        aria-label={t(currentSlideData.title_key)}
                    >
                        <div className="hero-slide-overlay vibrant-overlay">
                            <div className="hero-slide-content">
                                <div className="hero-text-block animated-text">
                                    <p className="hero-slide-kicker"><FaTicketAlt /> {t('home_hero_kicker_vibrant')}</p>
                                    <h1 className="hero-slide-title">{t(currentSlideData.title_key)}</h1>
                                    <p className="hero-slide-desc">{t(currentSlideData.desc_key)}</p>
                                    <Link to={`/banner-theme/${currentSlideData.themeServerKey}`} className="hero-slide-button vibrant-button">
                                        {t(currentSlideData.buttonText_key)} <FaChevronRight className="button-icon" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        {this.slides.length > 1 && (
                            <>
                                <button onClick={this.prevSlide} className="slide-control prev" aria-label={t('previous_slide')}><FaChevronLeft /></button>
                                <button onClick={this.nextSlide} className="slide-control next" aria-label={t('next_slide')}><FaChevronRight /></button>
                                <div className="slide-indicators">
                                    {this.slides.map((_, index) => (
                                        <button key={index} className={`indicator ${index === currentSlide ? 'active' : ''}`} onClick={() => this.goToSlide(index)} aria-label={`Go to slide ${index + 1}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                )}

                <div className="section-divider-top">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120"><path fill="#f9f9f9" fillOpacity="1" d="M0,96L120,80C240,64,480,32,720,32C960,32,1200,64,1320,80L1440,96L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path></svg>
                </div>

                {/* 2. 큐레이션 섹션 */}
                <section className="home-section curation-section">
                    <h2 className="home-section-title">{t('home_curation_section_title')}</h2>
                    <div className="curation-grid">
                        {curationTabs.map(tab => (
                            <Link to={tab.link} key={tab.id} className="curation-card">
                                <div className="curation-card-icon">{tab.icon}</div>
                                <h3 className="curation-card-title">{t(tab.titleKey)}</h3>
                                <p className="curation-card-desc">{t(tab.descriptionKey)}</p>
                                <span className="curation-card-cta">{t(tab.ctaKey, t('view_more'))} <FaChevronRight /></span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 3. 주요/다가오는 축제 알림 */}
                {upcomingFestivals.length > 0 && (
                    <section className="home-section upcoming-festivals-highlight-section">
                        <h2 className="home-section-title"><FaRegCalendarAlt /> {t('home_upcoming_festivals_title')}</h2>
                        <div className="upcoming-festivals-grid">
                            {upcomingFestivals.map(festival => (
                                <Link to={festival.link} key={festival.id} className="upcoming-festival-card">
                                    <div className="upcoming-card-image-wrapper">
                                        <img src={`${process.env.PUBLIC_URL}${festival.image}`} alt={t(festival.nameKey)} className="upcoming-card-image" />
                                        <span className="upcoming-card-theme-badge">{t(`theme_badge_${festival.themeKey}`)}</span>
                                    </div>
                                    <div className="upcoming-card-content">
                                        <h3 className="upcoming-card-name">{t(festival.nameKey)}</h3>
                                        <p className="upcoming-card-location"><FaMapMarkedAlt size={12} /> {t(festival.locationKey, "전국")}</p>
                                        <p className="upcoming-card-date">{festival.date}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="section-more-button-container">
                            <Link to="/festivals?filter=upcoming" className="section-more-button">{t('view_all_upcoming_festivals')}</Link>
                        </div>
                    </section>
                )}

                {/* 4. "이 지역 어때요?" 섹션 */}
                <section className="home-section featured-regions-section">
                    <h2 className="home-section-title"><FaSearchLocation /> {t('home_featured_regions_title')}</h2>
                    <div className="featured-regions-grid">
                        {featuredRegions.map(region => (
                            <Link to={region.link} key={region.id} className="featured-region-card">
                                <img src={`${process.env.PUBLIC_URL}${region.image}`} alt={t(region.nameKey)} className="featured-region-image" />
                                <div className="featured-region-overlay">
                                    <h3 className="featured-region-name">{t(region.nameKey)}</h3>
                                    <p className="featured-region-desc">{t(region.descriptionKey)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 5. 로그인 사용자 맞춤 추천 축제 */}
                {isLoggedIn && recommendations.length > 0 && (
                    <section className="home-section recommended-festivals-section user-recommendations">
                        <h2 className="home-section-title"><FaRegStar /> {t('home_user_recommend_title', { userName: userName })}</h2>
                        {loadingRecs ? <p className="loading-message">{t('loading_results')}</p> : recError ? <p className="error-message">{recError}</p> : (
                            <div className="home-card-list four-cards">
                                {recommendations.slice(0, 8).map((festival, idx) => ( // 최대 8개 추천
                                    <div className="home-festival-card" key={festival['축제일련번호'] || `${festival['축제명']}-${idx}-rec`}>
                                        <Link to={`/festivals`}> {/* 실제 상세 페이지 링크로 수정 필요 */}
                                            <div className="home-card-image-wrapper">
                                                <img
                                                    src={festival['대표이미지'] || `${process.env.PUBLIC_URL}/images/placeholder_festival.png`}
                                                    alt={festival['축제명']}
                                                    className="home-card-image"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL}/images/placeholder_festival.png`; }}
                                                />
                                            </div>
                                        </Link>
                                        <div className="home-card-body">
                                            <h3 className="home-card-title">
                                                <Link to={`/festivals`}>{festival['축제명']}</Link>
                                            </h3>
                                            {festival['개최장소'] && (
                                                <p className="home-card-location">
                                                    <FaMapMarkedAlt size={12} style={{ marginRight: '5px', opacity: 0.7 }} />
                                                    {festival['개최장소']}
                                                </p>
                                            )}
                                            <p className="home-card-date">
                                                <FaRegCalendarAlt size={12} style={{ marginRight: '5px', opacity: 0.7 }} />
                                                {t('festivals_card_duration_simple', {
                                                    startDate: festival['축제시작일자'],
                                                    endDate: festival['축제종료일자']
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {recommendations.length > 4 && (
                            <div className="section-more-button-container">
                                <Link to="/festivals?filter=recommended" className="section-more-button">{t('view_more_recommendations')}</Link>
                            </div>
                        )}
                    </section>
                )}
                {!isLoggedIn && (
                    <section className="home-section login-cta-section">
                        <FaUsers className="login-cta-icon" />
                        <h2 className="home-section-title secondary">{t('home_login_cta_title')}</h2>
                        <p>{t('home_login_for_recommendations')}</p>
                        <Link to="/login" className="hero-slide-button vibrant-button">{t('login_button')}</Link>
                    </section>
                )}

                {/* 6. "여행 꿀팁" 섹션 */}
                <section className="home-section travel-tips-section">
                    <h2 className="home-section-title"><FaInfoCircle /> {t('home_travel_tips_title')}</h2>
                    <div className="travel-tips-list">
                        {travelTips.map(tip => (
                            <Link to={tip.link} key={tip.id} className="travel-tip-item">
                                <div className="tip-icon-wrapper">{tip.icon}</div>
                                <div className="tip-content">
                                    <h4 className="tip-title">{t(tip.titleKey)}</h4>
                                    <p className="tip-summary">{t(tip.summaryKey)}</p>
                                </div>
                                <FaChevronRight className="tip-arrow" />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 7. 서비스 배너 섹션 */}
                {serviceBanners.length > 0 && (
                    <section className="home-section service-banner-section">
                        <h2 className="home-section-title"><FaLightbulb /> {t('home_partner_services_title')}</h2>
                        <div className="service-banner-grid">
                            {serviceBanners.map(banner => (
                                <Link to={banner.link} key={banner.id} className="service-banner-item" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}${banner.image})` }}>
                                    <div className="service-banner-overlay">
                                        <h3 className="service-banner-title">{t(banner.titleKey)}</h3>
                                        <p className="service-banner-desc">{t(banner.descriptionKey)}</p>
                                        <span className="service-banner-cta">{t('learn_more')} <FaChevronRight /></span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 8. "커뮤니티 하이라이트" */}
                <section className="home-section community-highlights-section">
                    <h2 className="home-section-title"><FaComments />{t('home_community_highlights_title')}</h2>
                    <div className="community-highlights-grid">
                        {communityHighlights.map(highlight => (
                            <Link to={highlight.link} key={highlight.id} className="community-highlight-card">
                                <div className="community-card-image-wrapper">
                                    <img src={`${process.env.PUBLIC_URL}${highlight.image}`} alt={t(highlight.titleKey)} className="community-card-image" />
                                </div>
                                <div className="community-card-content">
                                    <span className={`highlight-type-badge type-${highlight.typeKey}`}>{t(highlight.typeKey)}</span>
                                    <h4 className="highlight-title-card">{t(highlight.titleKey)}</h4>
                                    <div className="highlight-meta">
                                        <span className="highlight-author-card">{t('by_author', { author: highlight.author })}</span>
                                        <span className="highlight-likes-card"><FaRegStar style={{ marginRight: '4px' }} /> {highlight.likes}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="section-more-button-container">
                        <Link to="/community" className="section-more-button">{t('view_more_community')}</Link>
                    </div>
                </section>

                {/* 9. 일자리 정보 섹션 */}
                <section className="home-section job-info-section vibrant-bg">
                    <div className="job-info-content">
                        <FaHandsHelping className="job-info-icon" />
                        <h2 className="home-section-title secondary inverted">{t('home_job_title')}</h2>
                        <p className="inverted-text">{t('home_job_desc1')}</p>
                        <p className="inverted-text">{t('home_job_desc2')}</p>
                        <button className="hero-slide-button alt-button" onClick={this.handleJobInfoClick}>
                            {t('home_job_button')} <FaMapMarkedAlt style={{ marginLeft: '8px' }} />
                        </button>
                    </div>
                </section>

                {/* 10. 푸터 */}
                <footer className="home-footer">
                    <div className="footer-content-wrapper">
                        <div className="footer-top-row">
                            <div className="footer-links">
                                <Link to="/about">{t('footer_about_us')}</Link>
                                <Link to="/terms">{t('footer_terms')}</Link>
                                <Link to="/privacy">{t('footer_privacy')}</Link>
                                <Link to="/contact">{t('footer_contact_us')}</Link>
                            </div>
                        </div>
                        <div className="footer-main-content">
                            <div className="footer-info">
                                <h3 className="footer-appname">{t('appName')}</h3>
                                <p>{t('footer_address')}</p>
                                <p>{t('footer_tel')} | {t('footer_email')}</p>
                                <p>{t('footer_biz_info')} | {t('footer_tourism_biz_info')}</p>
                            </div>
                            <div className="footer-link-group">
                                <h4>{t('footer_navigation_title')}</h4>
                                <Link to="/festivals">{t('nav_all_festivals')}</Link>
                                <Link to="/regions">{t('nav_regions')}</Link>
                                <Link to="/themes">{t('nav_themes')}</Link>
                                <Link to="/map">{t('nav_map')}</Link>
                            </div>
                            <div className="footer-social-and-partners">
                                <h4>{t('footer_social_title')}</h4>
                                <div className="footer-social-icons">
                                    <a href="#!" aria-label="Facebook" title="Facebook"><img src={`${process.env.PUBLIC_URL}/images/sns/facebook_icon.svg`} alt="Facebook" /></a>
                                    <a href="#!" aria-label="Instagram" title="Instagram"><img src={`${process.env.PUBLIC_URL}/images/sns/instagram_icon.svg`} alt="Instagram" /></a>
                                    <a href="#!" aria-label="Youtube" title="Youtube"><img src={`${process.env.PUBLIC_URL}/images/sns/youtube_icon.svg`} alt="Youtube" /></a>
                                    <a href="#!" aria-label="Blog" title="Blog"><img src={`${process.env.PUBLIC_URL}/images/sns/blog_icon.svg`} alt="Blog" /></a>
                                </div>
                            </div>
                        </div>
                        <div className="footer-copyright">
                            <p>&copy; {new Date().getFullYear()} {t('appName')}. {t('footer_rights_reserved')}</p>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
}

export default withTranslation()(Home);