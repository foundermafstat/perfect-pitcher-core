export const en = {
    projectInfo: {
        general: '{name} {version} - {description}. Release date: {releaseDate}.',
        features: 'Main features of the AIrine project:',
        technologies: 'Technologies used in the AIrine project:',
        team: 'AIrine development team:',
        faq: 'Frequently asked questions about AIrine:',
        commands: 'Available voice commands in AIrine:',
        examples: 'Command examples'
    },
    newStory: {
        title: "Create new story",
        preview: "Story preview",
        generateAll: "Generate all",
        generateLogo: "Generate logo",
        regenerate: "Regenerate",
        loading: "Generating...",
        creating: "Creating...",
        create: "Create story",
        cancel: "Cancel",
        logoPromptPlaceholder: "Logo idea/style",
        stepLabel: "Step {current} / {total}",
        deckType: {
            label: "Presentation type",
            startup: "Startup Pitch Deck",
            sales: "Sales Deck",
            launch: "Product Launch Deck",
            strategy: "Internal Strategy Deck",
            investor: "Investor Update Deck",
            education: "Educational / Training Deck",
            keynote: "Conference / Keynote Deck",
        },
        placeholders: {
            projectName: "Project name",
            oneLiner: "One-liner",
            empty: "— empty —",
        },
        sections: {
            basics: { title: "1. Basics" },
            problem: { title: "2. Problem & Value" },
            solution: { title: "3. Solution" },
            product: { title: "4. Product" },
            more: { title: "5–9. Market, Monetization, Progress, Team" },
            visuals: { title: "10. Visualization" },
        },
        fields: {
            name: "Project name?",
            oneLiner: "One sentence: what does the project do?",
            stage: "Stage (idea, MVP, product, scale)",
            problem: "What problem do you solve?",
            audience: "Target audience",
            urgency: "Why now?",
            solution: "How does your product solve it?",
            differentiation: "Differentiation/uniqueness",
            technologies: "Technologies/approach",
            productOverview: "How it looks and works (2–3 sentences)",
            demoAssets: "Demo/prototype/screenshots",
            features: "Key features",
            marketCoverage: "Market coverage (geography, segments)",
            marketSize: "Market size (if any)",
            competitors: "Main competitors",
            monetization: "How do you monetize?",
            traction: "Progress/metrics",
            goals: "Goals for next 6–12 months",
            team: "Founders and key team",
            teamExperience: "Experience and expertise",
            funding: "Funding needs (how much and for what)",
            visualAssets: "Existing brand/logo/media",
            visualsNeed: "Need illustrations/graphics/infographics?",
            // extra fields per deck types
            productName: "Product name",
            pains: "Client's main pain points",
            solvePains: "How the product solves pains",
            caseStudies: "Case studies / success stories",
            roi: "ROI / client benefits",
            pricing: "Pricing / offer details",
            nextSteps: "Next steps (CTA)",
            productVersion: "Product version",
            usp: "Unique selling points (USP)",
            innovations: "Key features / innovations",
            differencePrev: "How it's different from previous solutions",
            releaseTimeline: "Release timeline & availability",
            companyStatus: "Current company status (summary)",
            periodGoals: "Main goals for the period",
            challenges: "Key challenges",
            strategy: "Strategy to overcome challenges",
            roadmap: "Roadmap & milestones",
            kpis: "KPIs & expected results",
            responsibilities: "Responsibilities & team roles",
            resources: "Required resources",
            companyStage: "Company name & current stage",
            achievements: "Achievements since last update",
            keyMetrics: "Key metrics (users, revenue, growth)",
            productUpdates: "Product updates & launches",
            marketChanges: "Market changes affecting the company",
            teamUpdates: "Team updates",
            fundingStatus: "Funding / financial status",
            topic: "Topic / subject",
            knowledgeLevel: "Target audience knowledge level",
            learningObjectives: "Main learning objectives",
            keyConcepts: "Key concepts to explain",
            contentStructure: "Step-by-step content structure",
            examples: "Examples / case studies",
            takeaways: "Summary & takeaways",
            exercises: "Exercises / interactive parts",
            talkTitle: "Title of the talk",
            speaker: "Speaker name & credentials",
            bigIdea: "Main topic / big idea",
            audienceExpectations: "Target audience & expectations",
            keyPoints: "Key points or arguments",
            supportingData: "Supporting data & visuals",
            conclusionCta: "Conclusion & call to action",
        },
    },
    broadcast: {
        end: "End Broadcasting",
        live: "Live",
        start: "Start Broadcasting"
    },
    header: {
        title: "About",
        about: "This is a project that aims to demonstrate how to use OpenAI Realtime API with WebRTC in a modern Next 15 project. It has shadcn/ui components already installed and the WebRTC audio session hook already implemented. Clone the project and define your own tools.",
        banner: "Realtime AImodel API with WebRTC",
        bannerLink: "Learn more →",
        beta: "Beta",
        dark: "Dark",
        github: "Star on GitHub",
        language: "Language",
        light: "Light",
        logo: "AIrine",
        system: "System",
        theme: "Toggle theme",
        twitter: "Follow on"
    },
    hero: {
        badge: "Next.js + shadcn/ui",
        subtitle: "Demo by clicking the button below and try available tools",
        title: "AIrine"
    },
    messageControls: {
        content: "Content",
        filter: "Filter by type",
        log: "Log to Console",
        logs: "Conversation Logs",
        search: "Search messages...",
        type: "Type",
        view: "View Logs"
    },
    status: {
        error: "Whoops!",
        info: "Toggling Voice Assistant...",
        language: "Language switched from",
        session: "Session established",
        success: "We're live, baby!",
        toggle: "Toggling Voice Assistant..."
    },
    tokenUsage: {
        input: "Input Tokens",
        output: "Output Tokens",
        total: "Total Tokens",
        usage: "Token Usage"
    },
    tools: {
        availableTools: {
            title: "Available Tools",
            copyFn: {
                description: 'Say "Copy that to clipboard" to paste it somewhere.',
                name: "Copy Fn"
            },
            getTime: {
                description: 'Ask "Tell me what time is it?" to get current time.',
                name: "Get Time"
            },
            launchWebsite: {
                description: '"Take me to [website]" to launch a site in a new tab.',
                name: "Launch Website"
            },
            partyMode: {
                description: 'Say "Start party mode" for a dynamic confetti animation!',
                name: "Party Mode"
            },
            themeSwitcher: {
                description: 'Say "Change background" or "Switch to dark mode" or "Switch to light mode".',
                name: "Theme Switcher"
            },
            scrapeWebsite: {
                name: "Website Scraper",
                description: 'Say "Scrape [website URL]" to extract content from a webpage.'
            }
        },
        clipboard: {
            description: "You can now paste it somewhere.",
            success: "Text copied to clipboard. Ask the user to paste it somewhere.",
            toast: "Text copied to clipboard!"
        },
        launchWebsite: {
            description: "Failed to launch website",
            success: "Launched the site! Tell the user it's been launched.",
            toast: "Launching website "
        },
        partyMode: {
            description: "Failed to activate party mode",
            success: "Party mode activated",
            toast: "Party mode!",
            failed: "Failed to activate party mode",
        },
        switchTheme: "Theme switched to ",
        themeFailed: "Failed to switch theme",
        time: "Announce to user: The current time is ",
        scrapeWebsite: {
            success: "Website content extracted successfully",
            description: "Failed to scrape website content",
            toast: "Scraping website..."
        }
    },
    transcriber: {
        title: "Live Transcript"
    },
    voice: {
        select: "Select a voice",
        ash: "Ash - Gentle & Professional",
        ballad: "Ballad - Warm & Engaging",
        coral: "Coral - Clear & Friendly",
        sage: "Sage - Authoritative & Calm",
        verse: "Verse - Dynamic & Expressive"
    },
    language: "English",
    languagePrompt: "Speak and respond only in English. It is crucial that you maintain your responses in English. If the user speaks in other languages, you should still respond in English.",
    slides: {
        commands: {
            next: "Next",
            previous: "Previous",
            new: "New Slide",
            delete: "Delete Slide",
            goTo: "Go to slide:",
            title: "Card Controls",
            slideCount: "Slide {current} of {total}"
        },
        responses: {
            nextSlide: "Moved to the next slide",
            prevSlide: "Moved to the previous slide",
            goToSlide: "Moved to slide {number}",
            newSlide: "Created a new slide",
            deleted: "Slide deleted",
            cannotDelete: "Cannot delete the last slide",
            invalidSlide: "Invalid slide number"
        }
    },
    account: {
        title: "Account",
        profile: "Profile",
        email: "Email",
        role: "Role",
        wallet: "Wallet",
        tokens: "Tokens",
        authAndWallet: "Authentication and Wallet",
        linkCurrentWallet: "Link current wallet",
        balanceTopUp: "Balance Top-up",
        onchainPurchase: "Onchain token purchase",
        onchainHint: "Send a transaction to the smart contract, then paste its hash.",
        txHashPlaceholder: "txHash (0x...)",
        credit: "Credit",
        fiatTopUp: "Fiat top-up (Stripe)",
        fiatHint: "Fiat balance is stored separately and can be used later for internal operations.",
        openCatalog: "Open product catalog",
        linkEmailTitle: "Link email via social login",
        linkEmailHint: "Sign in with a social provider to attach an email to your account.",
        viewPublicProfile: "View public profile",
    },
    navigation: {
        home: "Home",
        myStories: "My Stories",
        allStories: "All Stories",
        projects: "Projects",
        products: "Products",
        signin: "Sign In",
        footer: {
            product: "Product",
            stories: "Stories",
            editor: "Editor",
            support: "Support",
            account: "Account",
            help: "Help",
            company: "Company",
            about: "About",
            contact: "Contact"
        }
    },
    editor: {
        loading: "Loading...",
        storyNotFound: "Story not found",
        loadingError: "Error loading story",
        newSlide: "New Slide",
        addSlideError: "Error adding slide",
        slideAdded: "Slide added",
        save: "Save",
        storySaved: "Story saved",
        saveError: "Error saving story",
        delete: "Delete",
        deleteConfirm: "Delete story forever?",
        storyDeleted: "Story deleted",
        deleteError: "Failed to delete story",
        presentation: "Presentation",
        slide: "Slide",
        saveChangesError: "Failed to save changes",
        reorderError: "Failed to save slide order",
        panels: {
            elements: "Elements",
            layers: "Layers",
            slides: "Slides",
            background: "Background",
            all: "All",
            text: "Text",
            shapes: "Shapes",
            addSlide: "Add",
            goTo: "Go to:",
            currentOrder: "Current order:",
            backgroundType: "Background type",
            backgroundTypeSelect: "Select background type",
            transparent: "Transparent",
            color: "Color",
            gradient: "Gradient",
            youtube: "YouTube video",
            backgroundColor: "Background Color",
            gradientColors: "Gradient Colors",
            gradientAngle: "Angle (degrees)",
            youtubeUrl: "YouTube URL",
            youtubeUrlPlaceholder: "https://www.youtube.com/watch?v=...",
            youtubeHint: "Video will automatically play when slide is visible"
        },
        canvas: {
            elementsPanel: "Elements Panel",
            elementsTitle: "Elements",
            layersTitle: "Layers",
            zoomOut: "Zoom Out",
            zoomIn: "Zoom In",
            saveAsPng: "Save as PNG",
            exportToPdf: "Export to PDF",
            elementSettings: "Element Settings",
            deleteElement: "Delete Element",
            slideSavedPng: "Slide successfully saved as PNG",
            slideSaveError: "Failed to save slide as image",
            noSlidesToExport: "No slides to export",
            preparingPdf: "Preparing PDF with {count} slides...",
            processingSlide: "Processed {current} of {total} slides...",
            slideProcessError: "Failed to process slide {number}, skipping...",
            pdfExported: "Presentation successfully exported to PDF",
            pdfExportError: "Failed to export presentation to PDF",
            unknownError: "Unknown error"
        },
        elementTypes: {
            text: "Text",
            image: "Image",
            rectangle: "Rectangle", 
            circle: "Circle",
            button: "Button"
        },
        settings: {
            addColor: "Add Color"
        }
    },
    sidebar: {
        navigation: "Navigation"
    }
}