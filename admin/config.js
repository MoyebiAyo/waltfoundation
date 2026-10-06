// Decap CMS configuration (loaded by admin/index.html via an absolute path,
// which keeps it working under Vercel cleanUrls where /admin has no trailing slash).
window.CMS_CONFIG = {
  "backend": {
    "name": "github",
    "repo": "MoyebiAyo/waltfoundation",
    "branch": "main",
    "base_url": "https://www.waltscharityef.com",
    "auth_endpoint": "/api/auth/request"
  },
  "site_url": "https://www.waltscharityef.com",
  "display_url": "https://www.waltscharityef.com",
  "logo_url": "https://www.waltscharityef.com/assets/img/logo.webp",
  "locale": "en",
  "media_folder": "assets/img/uploads",
  "public_folder": "/assets/img/uploads",
  "collections": [
    {
      "name": "outreaches",
      "label": "Outreach posts",
      "label_singular": "outreach post",
      "folder": "content/outreaches",
      "create": true,
      "format": "json",
      "extension": "json",
      "slug": "{{year}}-{{month}}-{{slug}}",
      "sortable_fields": [
        "date",
        "title"
      ],
      "summary": "{{title}} — {{date}}",
      "fields": [
        {
          "label": "Title",
          "name": "title",
          "widget": "string"
        },
        {
          "label": "Date",
          "name": "date",
          "widget": "datetime",
          "format": "YYYY-MM-DD",
          "date_format": "YYYY-MM-DD",
          "time_format": false,
          "hint": "Displayed as \"Month Year\" on the site; newest posts appear first."
        },
        {
          "label": "Location",
          "name": "location",
          "widget": "string",
          "required": false,
          "hint": "e.g. \"Iwo, Osun State\""
        },
        {
          "label": "What was delivered",
          "name": "delivered",
          "widget": "text",
          "hint": "One or two sentences describing the outreach and who it reached."
        },
        {
          "label": "Photos",
          "name": "images",
          "widget": "list",
          "required": false,
          "add_to_top": true,
          "fields": [
            {
              "label": "Photo",
              "name": "full",
              "widget": "image"
            },
            {
              "label": "Thumbnail",
              "name": "thumb",
              "widget": "image",
              "required": false,
              "hint": "Optional smaller version. Leave empty to reuse the photo above (recommended)."
            },
            {
              "label": "Caption",
              "name": "caption",
              "widget": "string"
            },
            {
              "label": "Alt text",
              "name": "alt",
              "widget": "string",
              "required": false,
              "hint": "Describe the photo for screen readers and search engines."
            }
          ]
        }
      ]
    },
    {
      "name": "hero",
      "label": "Homepage hero",
      "files": [
        {
          "name": "hero-config",
          "label": "Hero slideshow & headline",
          "file": "content/hero.json",
          "format": "json",
          "fields": [
            {
              "label": "Eyebrow (small line above the title)",
              "name": "eyebrow",
              "widget": "string"
            },
            {
              "label": "Title line 1",
              "name": "titleLine1",
              "widget": "string"
            },
            {
              "label": "Title line 2",
              "name": "titleLine2",
              "widget": "string",
              "hint": "An amber full stop is added automatically after this line."
            },
            {
              "label": "Subtitle",
              "name": "subtitle",
              "widget": "text"
            },
            {
              "label": "Primary button",
              "name": "primaryCta",
              "widget": "object",
              "fields": [
                {
                  "label": "Label",
                  "name": "label",
                  "widget": "string"
                },
                {
                  "label": "Link",
                  "name": "href",
                  "widget": "string"
                }
              ]
            },
            {
              "label": "Secondary button",
              "name": "secondaryCta",
              "widget": "object",
              "fields": [
                {
                  "label": "Label",
                  "name": "label",
                  "widget": "string"
                },
                {
                  "label": "Link",
                  "name": "href",
                  "widget": "string"
                }
              ]
            },
            {
              "label": "Background slides",
              "name": "slides",
              "widget": "list",
              "add_to_top": true,
              "hint": "Wide landscape photos work best. The first one is shown first.",
              "fields": [
                {
                  "label": "Image",
                  "name": "image",
                  "widget": "image"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "programmes",
      "label": "Programmes",
      "files": [
        {
          "name": "programmes-config",
          "label": "The four programmes",
          "file": "content/programmes.json",
          "format": "json",
          "fields": [
            {
              "label": "Programmes",
              "name": "items",
              "widget": "list",
              "add_to_top": true,
              "fields": [
                {
                  "label": "Title",
                  "name": "title",
                  "widget": "string"
                },
                {
                  "label": "Short description (homepage card)",
                  "name": "summary",
                  "widget": "text"
                },
                {
                  "label": "Long description (About page)",
                  "name": "detail",
                  "widget": "text"
                },
                {
                  "label": "One-line blurb (Donate page)",
                  "name": "donateBlurb",
                  "widget": "string"
                },
                {
                  "label": "Card image (homepage)",
                  "name": "cardImage",
                  "widget": "image"
                },
                {
                  "label": "Card image alt text",
                  "name": "cardImageAlt",
                  "widget": "string"
                },
                {
                  "label": "Small image (About page)",
                  "name": "thumbImage",
                  "widget": "image"
                },
                {
                  "label": "Small image alt text",
                  "name": "thumbImageAlt",
                  "widget": "string"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "videos",
      "label": "Videos",
      "files": [
        {
          "name": "videos-config",
          "label": "Homepage videos",
          "file": "content/videos.json",
          "format": "json",
          "fields": [
            {
              "label": "Videos",
              "name": "items",
              "widget": "list",
              "add_to_top": true,
              "fields": [
                {
                  "label": "Title",
                  "name": "title",
                  "widget": "string",
                  "hint": "Used for search engines; can be longer than the label below."
                },
                {
                  "label": "Label (shown on the video card)",
                  "name": "eyebrow",
                  "widget": "string"
                },
                {
                  "label": "Description",
                  "name": "description",
                  "widget": "text"
                },
                {
                  "label": "Duration",
                  "name": "duration",
                  "widget": "string",
                  "required": false,
                  "hint": "Display format, e.g. \"9:38\" or \"0:47\"."
                },
                {
                  "label": "Poster image",
                  "name": "poster",
                  "widget": "image"
                },
                {
                  "label": "Video file (self-hosted)",
                  "name": "src",
                  "widget": "file",
                  "required": false,
                  "hint": "Only for files already in assets/videos. Prefer YouTube for new videos."
                },
                {
                  "label": "YouTube video ID",
                  "name": "youtubeId",
                  "widget": "string",
                  "required": false,
                  "hint": "Preferred for new videos — e.g. dQw4w9WgXcQ from youtube.com/watch?v=dQw4w9WgXcQ. If set, it is used instead of the file above."
                },
                {
                  "label": "Upload date",
                  "name": "uploadDate",
                  "widget": "datetime",
                  "format": "YYYY-MM-DD",
                  "date_format": "YYYY-MM-DD",
                  "time_format": false
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "team",
      "label": "Team",
      "files": [
        {
          "name": "team-config",
          "label": "Board members & Grand Patron",
          "file": "content/team.json",
          "format": "json",
          "fields": [
            {
              "label": "Board members",
              "name": "members",
              "widget": "list",
              "add_to_top": true,
              "fields": [
                {
                  "label": "Full name",
                  "name": "name",
                  "widget": "string"
                },
                {
                  "label": "Role",
                  "name": "role",
                  "widget": "string"
                },
                {
                  "label": "Photo",
                  "name": "photo",
                  "widget": "image"
                },
                {
                  "label": "Photo alt text",
                  "name": "photoAlt",
                  "widget": "string"
                },
                {
                  "label": "Short bio",
                  "name": "bio",
                  "widget": "text"
                },
                {
                  "label": "Card size",
                  "name": "size",
                  "widget": "select",
                  "options": [
                    "wide",
                    "standard"
                  ],
                  "default": "standard",
                  "hint": "The first row of the team grid uses \"wide\" cards."
                }
              ]
            },
            {
              "label": "Grand Patron",
              "name": "patron",
              "widget": "object",
              "fields": [
                {
                  "label": "Role / title",
                  "name": "role",
                  "widget": "string"
                },
                {
                  "label": "Full name",
                  "name": "name",
                  "widget": "string"
                },
                {
                  "label": "Photo",
                  "name": "photo",
                  "widget": "image"
                },
                {
                  "label": "Photo alt text",
                  "name": "photoAlt",
                  "widget": "string"
                },
                {
                  "label": "Description",
                  "name": "bio",
                  "widget": "text"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "gallery",
      "label": "Gallery",
      "files": [
        {
          "name": "gallery-config",
          "label": "Photo gallery",
          "file": "content/gallery.json",
          "format": "json",
          "fields": [
            {
              "label": "Gallery photos",
              "name": "photos",
              "widget": "list",
              "add_to_top": true,
              "fields": [
                {
                  "label": "Photo",
                  "name": "full",
                  "widget": "image"
                },
                {
                  "label": "Thumbnail",
                  "name": "thumb",
                  "widget": "image",
                  "required": false,
                  "hint": "Leave empty to reuse the photo above (recommended)."
                },
                {
                  "label": "Caption",
                  "name": "caption",
                  "widget": "string"
                },
                {
                  "label": "Alt text",
                  "name": "alt",
                  "widget": "string"
                }
              ]
            },
            {
              "label": "Homepage preview",
              "name": "homePreview",
              "widget": "list",
              "add_to_top": true,
              "hint": "Exactly six photos, shown in this order on the homepage.",
              "field": {
                "label": "Photo",
                "name": "photo",
                "widget": "image"
              }
            },
            {
              "label": "First Lady visit — heading",
              "name": "firstLadySection",
              "widget": "object",
              "fields": [
                {
                  "label": "Heading",
                  "name": "heading",
                  "widget": "string"
                },
                {
                  "label": "Description",
                  "name": "description",
                  "widget": "text"
                },
                {
                  "label": "Facebook post link",
                  "name": "postLink",
                  "widget": "string"
                },
                {
                  "label": "Link label",
                  "name": "postLinkLabel",
                  "widget": "string"
                }
              ]
            },
            {
              "label": "First Lady visit — photos",
              "name": "firstLady",
              "widget": "list",
              "add_to_top": true,
              "fields": [
                {
                  "label": "Photo",
                  "name": "full",
                  "widget": "image"
                },
                {
                  "label": "Thumbnail",
                  "name": "thumb",
                  "widget": "image",
                  "required": false,
                  "hint": "Leave empty to reuse the photo above (recommended)."
                },
                {
                  "label": "Caption",
                  "name": "caption",
                  "widget": "string"
                },
                {
                  "label": "Alt text",
                  "name": "alt",
                  "widget": "string"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "timeline",
      "label": "History timeline",
      "files": [
        {
          "name": "timeline-config",
          "label": "Milestones (About page)",
          "file": "content/timeline.json",
          "format": "json",
          "fields": [
            {
              "label": "Milestones",
              "name": "items",
              "widget": "list",
              "add_to_top": true,
              "fields": [
                {
                  "label": "Date",
                  "name": "date",
                  "widget": "datetime",
                  "format": "YYYY-MM-DD",
                  "date_format": "YYYY-MM-DD",
                  "time_format": false,
                  "hint": "Used for ordering only."
                },
                {
                  "label": "Date label (shown)",
                  "name": "dateLabel",
                  "widget": "string",
                  "hint": "e.g. \"June 7, 2023\" or \"2023 – today\"."
                },
                {
                  "label": "Title",
                  "name": "title",
                  "widget": "string"
                },
                {
                  "label": "Description",
                  "name": "description",
                  "widget": "text"
                },
                {
                  "label": "Dot colour",
                  "name": "accent",
                  "widget": "select",
                  "options": [
                    "amber",
                    "forest"
                  ],
                  "default": "amber"
                },
                {
                  "label": "Optional link at the end of the description",
                  "name": "link",
                  "widget": "object",
                  "required": false,
                  "collapsed": true,
                  "fields": [
                    {
                      "label": "Label",
                      "name": "label",
                      "widget": "string",
                      "required": false
                    },
                    {
                      "label": "Link",
                      "name": "href",
                      "widget": "string",
                      "required": false
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "founder",
      "label": "Founder & Grand Patron section",
      "files": [
        {
          "name": "founder-config",
          "label": "Founder & Grand Patron (About page)",
          "file": "content/founder.json",
          "format": "json",
          "fields": [
            {
              "label": "Photo",
              "name": "photo",
              "widget": "image"
            },
            {
              "label": "Photo alt text",
              "name": "photoAlt",
              "widget": "string"
            },
            {
              "label": "Photo caption",
              "name": "photoCaption",
              "widget": "text"
            },
            {
              "label": "Video",
              "name": "video",
              "widget": "object",
              "fields": [
                {
                  "label": "Title",
                  "name": "title",
                  "widget": "string"
                },
                {
                  "label": "Caption",
                  "name": "caption",
                  "widget": "text"
                },
                {
                  "label": "Description (for search engines)",
                  "name": "description",
                  "widget": "text"
                },
                {
                  "label": "Duration",
                  "name": "duration",
                  "widget": "string",
                  "required": false,
                  "hint": "e.g. \"0:47\"."
                },
                {
                  "label": "Poster image",
                  "name": "poster",
                  "widget": "image"
                },
                {
                  "label": "Search-engine thumbnail",
                  "name": "thumbnail",
                  "widget": "image"
                },
                {
                  "label": "Video file (self-hosted)",
                  "name": "src",
                  "widget": "file",
                  "required": false
                },
                {
                  "label": "YouTube video ID",
                  "name": "youtubeId",
                  "widget": "string",
                  "required": false,
                  "hint": "If set, it is used instead of the file above."
                },
                {
                  "label": "Upload date",
                  "name": "uploadDate",
                  "widget": "datetime",
                  "format": "YYYY-MM-DD",
                  "date_format": "YYYY-MM-DD",
                  "time_format": false
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "name": "settings",
      "label": "Site settings",
      "files": [
        {
          "name": "settings-config",
          "label": "General, donations, contact & compliance",
          "file": "content/settings.json",
          "format": "json",
          "fields": [
            {
              "label": "Organisation",
              "name": "org",
              "widget": "object",
              "collapsed": true,
              "fields": [
                {
                  "label": "Full name",
                  "name": "name",
                  "widget": "string"
                },
                {
                  "label": "Short name (footer logo line)",
                  "name": "shortName",
                  "widget": "string"
                },
                {
                  "label": "Footer tagline",
                  "name": "tagline",
                  "widget": "text"
                },
                {
                  "label": "Founding year",
                  "name": "foundingYear",
                  "widget": "string"
                }
              ]
            },
            {
              "label": "Compliance & numbers",
              "name": "compliance",
              "widget": "object",
              "collapsed": true,
              "fields": [
                {
                  "label": "Utility bar text (desktop)",
                  "name": "utilityBarFull",
                  "widget": "string"
                },
                {
                  "label": "Utility bar text (mobile)",
                  "name": "utilityBarShort",
                  "widget": "string"
                },
                {
                  "label": "CAC label",
                  "name": "cacLabel",
                  "widget": "string"
                },
                {
                  "label": "CAC number",
                  "name": "cacNumber",
                  "widget": "string"
                },
                {
                  "label": "CAC date",
                  "name": "cacDate",
                  "widget": "string"
                },
                {
                  "label": "SCUML number",
                  "name": "scumlNumber",
                  "widget": "string"
                },
                {
                  "label": "Footer board note",
                  "name": "boardNote",
                  "widget": "string"
                }
              ]
            },
            {
              "label": "Contact details",
              "name": "contact",
              "widget": "object",
              "collapsed": true,
              "fields": [
                {
                  "label": "Email address",
                  "name": "email",
                  "widget": "string"
                },
                {
                  "label": "Phone (display)",
                  "name": "phoneDisplay",
                  "widget": "string"
                },
                {
                  "label": "Phone (link",
                  "tel:…)": null,
                  "name": "phoneHref",
                  "widget": "string"
                },
                {
                  "label": "WhatsApp (display)",
                  "name": "whatsappDisplay",
                  "widget": "string"
                },
                {
                  "label": "WhatsApp (link)",
                  "name": "whatsappHref",
                  "widget": "string"
                },
                {
                  "label": "Operating region",
                  "name": "region",
                  "widget": "string"
                },
                {
                  "label": "Region note",
                  "name": "regionNote",
                  "widget": "text"
                },
                {
                  "label": "Contact form topics",
                  "name": "topics",
                  "widget": "list",
                  "field": {
                    "label": "Topic",
                    "name": "topic",
                    "widget": "string"
                  }
                }
              ]
            },
            {
              "label": "Social links",
              "name": "social",
              "widget": "object",
              "collapsed": true,
              "fields": [
                {
                  "label": "Facebook URL",
                  "name": "facebook",
                  "widget": "string"
                },
                {
                  "label": "Instagram URL",
                  "name": "instagram",
                  "widget": "string"
                }
              ]
            },
            {
              "label": "Donation amounts",
              "name": "donation",
              "widget": "object",
              "collapsed": true,
              "fields": [
                {
                  "label": "Preset amounts (₦)",
                  "name": "tiers",
                  "widget": "list",
                  "field": {
                    "label": "Amount",
                    "name": "amount",
                    "widget": "number"
                  }
                },
                {
                  "label": "Pre-selected amount (₦)",
                  "name": "defaultAmount",
                  "widget": "number"
                }
              ]
            },
            {
              "label": "Bank accounts",
              "name": "bank",
              "widget": "object",
              "collapsed": true,
              "fields": [
                {
                  "label": "Domiciliary account",
                  "name": "domiciliary",
                  "widget": "object",
                  "fields": [
                    {
                      "label": "Label",
                      "name": "label",
                      "widget": "string"
                    },
                    {
                      "label": "Bank",
                      "name": "bank",
                      "widget": "string"
                    },
                    {
                      "label": "Account name",
                      "name": "accountName",
                      "widget": "string"
                    },
                    {
                      "label": "Account number",
                      "name": "accountNumber",
                      "widget": "string"
                    },
                    {
                      "label": "Bank logo",
                      "name": "logo",
                      "widget": "image"
                    },
                    {
                      "label": "Logo alt text",
                      "name": "logoAlt",
                      "widget": "string"
                    },
                    {
                      "label": "Logo CSS classes",
                      "name": "logoClass",
                      "widget": "string"
                    }
                  ]
                },
                {
                  "label": "Naira account",
                  "name": "naira",
                  "widget": "object",
                  "fields": [
                    {
                      "label": "Label",
                      "name": "label",
                      "widget": "string"
                    },
                    {
                      "label": "Bank",
                      "name": "bank",
                      "widget": "string"
                    },
                    {
                      "label": "Account name",
                      "name": "accountName",
                      "widget": "string"
                    },
                    {
                      "label": "Account number",
                      "name": "accountNumber",
                      "widget": "string"
                    },
                    {
                      "label": "Bank logo",
                      "name": "logo",
                      "widget": "image"
                    },
                    {
                      "label": "Logo alt text",
                      "name": "logoAlt",
                      "widget": "string"
                    },
                    {
                      "label": "Logo CSS classes",
                      "name": "logoClass",
                      "widget": "string"
                    }
                  ]
                }
              ]
            },
            {
              "label": "Homepage stats",
              "name": "stats",
              "widget": "list",
              "collapsed": true,
              "fields": [
                {
                  "label": "Value",
                  "name": "value",
                  "widget": "string"
                },
                {
                  "label": "Label",
                  "name": "label",
                  "widget": "string"
                }
              ]
            },
            {
              "label": "Vision quote (homepage)",
              "name": "visionQuote",
              "widget": "text",
              "required": false
            }
          ]
        }
      ]
    }
  ]
};
