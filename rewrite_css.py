import re

with open(r'c:\Users\JOHANN\Documents\wc26\frontend\src\styles\global.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Remove old hero backgrounds
css = re.sub(r'/\* 14\. Premium Hero Backgrounds \*/.*?/\* Standard page header override for heroes \*/', '/* Standard page header override for heroes */', css, flags=re.DOTALL)

# Add new backgrounds
new_bgs = """
/* ------------------------------------------------------------
   14. Premium Authentic Backgrounds
   ------------------------------------------------------------ */

.bg-page-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.bg-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.bg-stadium-night { background-image: url('/images/bg-stadium-night.jpg'); }
.bg-trophy { background-image: url('/images/bg-trophy.jpg'); }
.bg-ronaldo { background-image: url('/images/bg-ronaldo.jpg'); }
.bg-messi { background-image: url('/images/bg-messi.jpg'); }
.bg-crowd { background-image: url('/images/bg-crowd.jpg'); }
.bg-tunnel { background-image: url('/images/bg-tunnel.jpg'); }

/* 70% to 85% opacity dark overlay for perfect text readability */
.bg-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background: linear-gradient(to bottom, rgba(11, 15, 25, 0.75), rgba(11, 15, 25, 0.90));
}

.content-relative {
  position: relative;
  z-index: 2;
}
"""

css = css.replace("/* Standard page header override for heroes */", new_bgs + "\n/* Standard page header override for heroes */")

with open(r'c:\Users\JOHANN\Documents\wc26\frontend\src\styles\global.css', 'w', encoding='utf-8') as f:
    f.write(css)
