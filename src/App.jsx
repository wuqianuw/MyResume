import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './style.css'

gsap.registerPlugin(ScrollTrigger)

/* ─── Mobile Menu ─── */
function useMobileMenu() {
  const hamburgerRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const hamburger = hamburgerRef.current
    const menu = menuRef.current
    if (!hamburger || !menu) return

    const onClick = () => {
      const open = hamburger.classList.toggle('open')
      menu.classList.toggle('open')
      document.body.style.overflow = open ? 'hidden' : ''
    }
    hamburger.addEventListener('click', onClick)

    const links = menu.querySelectorAll('.mobile-link, .btn-mobile')
    const onLinkClick = () => {
      hamburger.classList.remove('open')
      menu.classList.remove('open')
      document.body.style.overflow = ''
    }
    for (const l of links) l.addEventListener('click', onLinkClick)

    return () => {
      hamburger.removeEventListener('click', onClick)
      for (const l of links) l.removeEventListener('click', onLinkClick)
    }
  }, [])

  return { hamburgerRef, menuRef }
}

/* ─── Navbar: IntersectionObserver instead of scroll listener ─── */
function useNavbarActive() {
  useEffect(() => {
    const navLinks = document.querySelectorAll('.nav-link')
    const sections = document.querySelectorAll('section[id]')

    const cb = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id')
          for (const link of navLinks) {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
          }
        }
      }
    }

    const observer = new IntersectionObserver(cb, {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0,
    })
    for (const s of sections) observer.observe(s)

    return () => observer.disconnect()
  }, [])
}

/* ─── GSAP Animations ─── */
function useGSAPAnimations() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    /* Opening sequence — no blur, cheaper */
    const videoWrap = document.querySelector('.hero-media-wrap')
    const navbar = document.getElementById('navbar')
    const badge = document.querySelector('[data-anim="badge"]')
    const heroLines = document.querySelectorAll('.hero-line-inner')
    const desc = document.querySelector('[data-anim="desc"]')
    const cta = document.querySelector('[data-anim="cta"]')

    if (!videoWrap || !navbar) return

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    gsap.set(navbar, { y: -40, opacity: 0 })
    gsap.set(badge, { opacity: 0, y: 20 })
    gsap.set(heroLines, { y: '100%' })
    gsap.set([desc, cta], { opacity: 0, y: 24 })

    // No blur — just opacity + scale
    gsap.set(videoWrap, { scale: 1.06, opacity: 0.7 })
    tl.to(videoWrap, { scale: 1, opacity: 1, duration: 1.4, ease: 'power2.out' })
    tl.to(navbar, { y: 0, opacity: 1, duration: 0.7 }, 0.5)
    tl.to(badge, { opacity: 1, y: 0, duration: 0.6 }, 0.8)
    tl.to(heroLines, { y: '0%', duration: 0.9, stagger: 0.1, ease: 'power4.out' }, 1.1)
    tl.to(desc, { opacity: 1, y: 0, duration: 0.6 }, 2.0)
    tl.to(cta, { opacity: 1, y: 0, duration: 0.5 }, 2.2)

    /* Scroll sections — batch DOM queries once per section */
    const sections = document.querySelectorAll('[data-section]')
    for (const section of sections) {
      const labels = section.querySelectorAll('[data-split]')
      const staggerParents = section.querySelectorAll('[data-stagger]')
      const staggerItems = []
      for (const p of staggerParents) {
        const children = p.children
        if (children.length) staggerItems.push(...children)
        else staggerItems.push(p)
      }

      // Pre-wrap split text (once, not on scroll)
      for (const el of labels) {
        if (el.classList.contains('contact-title')) continue
        const text = el.textContent.trim()
        if (text && !el.querySelector('.split-line')) {
          el.innerHTML = `<span class="split-line"><span class="split-line-inner">${text}</span></span>`
        }
      }
      const splitLines = section.querySelectorAll('.split-line-inner')

      const parallaxEl = section.querySelector('[data-parallax]')
      const revealEls = section.querySelectorAll('[data-reveal]')

      ScrollTrigger.create({
        trigger: section,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          if (splitLines.length) {
            gsap.set(splitLines, { y: '100%' })
            gsap.to(splitLines, { y: '0%', duration: 0.9, stagger: 0.06, ease: 'power4.out' })
          }
          if (staggerItems.length) {
            gsap.set(staggerItems, { opacity: 0, y: 24 })
            gsap.to(staggerItems, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', delay: 0.3 })
          }
          if (parallaxEl) {
            gsap.set(parallaxEl, { opacity: 0, y: 30 })
            gsap.to(parallaxEl, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 })
          }
          for (const el of revealEls) {
            gsap.set(el, { clipPath: 'inset(0 100% 0 0)' })
            gsap.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power3.inOut', delay: 0.25 })
          }
        },
      })
    }

    ScrollTrigger.refresh()
  }, [])
}

/* ─── Component ─── */
export default function App() {
  const { hamburgerRef, menuRef } = useMobileMenu()
  useNavbarActive()
  useGSAPAnimations()

  return (
    <>
      <section id="hero" className="hero">
        <div className="hero-media-wrap">
          <video className="hero-video" autoPlay muted loop playsInline
            poster="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay"></div>
        </div>

        <nav className="navbar" id="navbar">
          <div className="nav-left">
            <span className="logo">吴啸天</span>
            <div className="nav-links">
              <a href="#hero" className="nav-link active">首页</a>
              <a href="#about" className="nav-link">关于我</a>
              <a href="#projects" className="nav-link">项目</a>
              <a href="#strengths" className="nav-link">技能</a>
              <a href="#contact" className="nav-link">联系</a>
            </div>
          </div>
          <div className="nav-right">
            <a href="#contact" className="btn-primary desktop-only">联系我</a>
            <button className="hamburger" ref={hamburgerRef} aria-label="切换菜单">
              <div className="hambox">
                <span className="line top"></span>
                <span className="line middle"></span>
                <span className="line bottom"></span>
              </div>
            </button>
          </div>
        </nav>

        <div className="mobile-menu" ref={menuRef}>
          <div className="mobile-menu-inner">
            <a href="#hero" className="mobile-link">首页</a>
            <a href="#about" className="mobile-link">关于我</a>
            <a href="#projects" className="mobile-link">项目</a>
            <a href="#strengths" className="mobile-link">技能</a>
            <a href="#contact" className="mobile-link">联系</a>
            <a href="#contact" className="btn-mobile">联系我</a>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-top">
            <span className="hero-badge" data-anim="badge">AI 应用开发 / 网络工程</span>
            <h1 className="hero-title">
              <span className="hero-line"><span className="hero-line-inner">构建智能应用，</span></span>
              <span className="hero-line"><span className="hero-line-inner">探索技术边界，</span></span>
              <span className="hero-line"><span className="hero-line-inner">一行代码一个世界。</span></span>
            </h1>
          </div>
          <div className="hero-bottom">
            <p className="hero-desc" data-anim="desc">热衷于将 AI 能力落地为真正可用的产品，在 Agent 开发与全栈工程之间寻找最佳平衡点。</p>
            <a href="#projects" className="btn-hero" data-anim="cta">
              查看作品
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="section about" data-section>
        <div className="container">
          <div className="about-grid">
            <div className="about-avatar-col" data-parallax>
              <div className="avatar-frame">
                <img src="/avatar.jpg" alt="吴啸天" className="avatar-img" loading="lazy" />
              </div>
              <div className="contact-mini">
                <div className="contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="m22 5-10 7L2 5"/></svg>
                  <span>wuwang667@qq.com</span>
                </div>
                <div className="contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>17837841884</span>
                </div>
                <div className="contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>河南省开封市</span>
                </div>
              </div>
            </div>

            <div className="about-bio-col">
              <span className="section-label" data-split>关于我</span>
              <h2 className="section-title" data-split>用代码连接想象力与现实。</h2>
              <p className="about-text" data-stagger>我是吴啸天，河南理工大学网络工程专业2025届毕业生。在校期间系统学习了计算机网络、网络信息安全、数据结构等核心课程，GPA 3.22/5.0，专业排名前15%。</p>
              <p className="about-text" data-stagger>从网络工程到 AI 应用开发，我始终对技术保持着强烈的好奇心。我熟练掌握大模型 API 接入、Prompt 编排、LangChain 框架以及前后端全栈开发，具备将 AI 能力落地为实际产品的能力。同时拥有扎实的网络工程基础，熟悉企业级网络架构设计与容器化部署。</p>
              <p className="about-text" data-stagger>作为一名中共党员，我认真负责、善于协作，始终追求技术上的精进与突破。</p>
            </div>

            <div className="about-stats-col" data-stagger></div>
          </div>
        </div>
      </section>

      <section id="projects" className="section projects" data-section>
        <div className="container">
          <div className="section-header">
            <span className="section-label" data-split>精选作品</span>
            <h2 className="section-title" data-split>项目经历.</h2>
          </div>
          <div className="projects-grid" data-stagger>
            <a href="http://47.110.69.206/" target="_blank" rel="noopener noreferrer" className="project-card wide">
              <div className="project-thumb" data-reveal>
                <img src="/chatbot.png" alt="全模态 AI 聊天机器人系统" className="project-img" loading="lazy" />
                <div className="project-thumb-overlay">
                  <span className="project-number">01</span>
                </div>
              </div>
              <div className="project-info">
                <span className="project-tag">2026.01 - 2026.05</span>
                <h3 className="project-name">全模态 AI 聊天机器人系统</h3>
                <p className="project-desc">基于 Spring Boot 4 + Vue 3 开发前后端分离 AI 聊天系统，接入 LangChain4j 与 DashScope/Qwen Omni 大模型，支持文本、图片、音频、视频多模态输入与 SSE 实时回复。</p>
                <div className="project-tech">
                  <span>Spring Boot 4</span><span>LangChain4j</span><span>Vue 3</span><span>Docker</span><span>MySQL</span>
                </div>
              </div>
            </a>

            <a href="http://47.110.69.206/" target="_blank" rel="noopener noreferrer" className="project-card">
              <div className="project-thumb" data-reveal>
                <img src="/ai-clothing.png" alt="AI 穿搭分析助手" className="project-img" loading="lazy" />
                <div className="project-thumb-overlay">
                  <span className="project-number">02</span>
                </div>
              </div>
              <div className="project-info">
                <span className="project-tag">2025.09 - 2025.12</span>
                <h3 className="project-name">AI 穿搭分析助手</h3>
                <p className="project-desc">基于 FastAPI + Next.js 构建多模态穿搭分析应用，支持上传穿搭图片并描述场景天气，调用 Qwen / DashScope 生成个性化建议。</p>
                <div className="project-tech">
                  <span>FastAPI</span><span>Next.js</span><span>LangChain</span><span>阿里云OSS</span><span>Docker</span>
                </div>
              </div>
            </a>

            <a href="http://47.110.69.206/" target="_blank" rel="noopener noreferrer" className="project-card">
              <div className="project-thumb" data-reveal>
                <div className="project-thumb-content" style={{ background: 'linear-gradient(135deg, #1a2e1a, #162e21)' }}>
                  <span className="project-number">03</span>
                  <div className="project-thumb-visual">
                    <div className="neural-grid">
                      {Array.from({ length: 25 }).map((_, i) => <span key={i} />)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="project-info">
                <span className="project-tag">2025.01 - 2025.06</span>
                <h3 className="project-name">基于 CNN 的入侵检测系统</h3>
                <p className="project-desc">采用 KDD-CUP99 数据集，利用 CNN 特征提取能力结合 Sklearn LogisticRegressionCV 分类器构建高效入侵检测模型，Django + Vue2 前后端实现。</p>
                <div className="project-tech">
                  <span>Python</span><span>Django</span><span>Vue 2</span><span>CNN</span><span>Sklearn</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section id="strengths" className="section strengths" data-section>
        <div className="container">
          <div className="section-header">
            <span className="section-label" data-split>专业技能</span>
            <h2 className="section-title" data-split>我的优势.</h2>
          </div>
          <div className="strengths-grid" data-stagger>
            <div className="strength-card">
              <div className="strength-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <h3 className="strength-title">Agent 开发</h3>
              <p className="strength-desc">熟悉大模型 API 接入流程，精通 Prompt 编排与多模态模型调用。具备 LangChain、LangChain4j、Deepseek / Qwen 等模型服务接入经验。</p>
            </div>
            <div className="strength-card">
              <div className="strength-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </div>
              <h3 className="strength-title">全栈开发</h3>
              <p className="strength-desc">熟练使用 Spring Boot / FastAPI / Next.js 构建前后端应用，掌握 Vue 3 / React 等前端框架，具备完整的项目开发与上线经验。</p>
            </div>
            <div className="strength-card">
              <div className="strength-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h3 className="strength-title">部署与工程化</h3>
              <p className="strength-desc">熟悉 Linux / Ubuntu / Docker / Nginx 等运维工具链，具备项目容器化部署、反向代理配置、生产环境问题排查的实战经验。</p>
            </div>
            <div className="strength-card">
              <div className="strength-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h3 className="strength-title">深度学习与 AI</h3>
              <p className="strength-desc">熟悉 PyTorch 深度学习框架，具备计算机视觉模型训练、模块优化与微调经验，能针对具体业务做出针对性优化。</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="section contact" data-section>
        <div className="contact-bg"></div>
        <div className="container contact-container">
          <div className="contact-content">
            <span className="section-label light" data-split>保持联系</span>
            <h2 className="contact-title">
              <span className="split-line"><span className="split-line-inner">有想法？</span></span>
              <span className="split-line"><span className="split-line-inner">随时聊聊。</span></span>
            </h2>
            <p className="contact-desc" data-stagger>无论是技术交流、项目合作还是实习机会，我都期待与您沟通。欢迎通过以下方式联系我。</p>
            <div data-stagger>
              <a href="mailto:wuwang667@qq.com" className="btn-contact">
                wuwang667@qq.com
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </a>
              <div className="contact-social">
                <a href="tel:17837841884" className="social-link">电话：17837841884</a>
                <a href="mailto:wuwang667@qq.com" className="social-link">邮箱</a>
                <a href="http://47.110.69.206/" target="_blank" rel="noopener noreferrer" className="social-link">个人项目</a>
              </div>
            </div>
          </div>
          <div className="contact-footer">
            <span>&copy; 2026 吴啸天. All rights reserved.</span>
            <span className="footer-tag">用代码创造价值</span>
          </div>
        </div>
      </section>
    </>
  )
}
