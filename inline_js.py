import sys

def inline_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    with open('ui/onboarding-tour.js', 'r', encoding='utf-8') as f:
        js_code = f.read()

    # Remove the external script tag
    html = html.replace('<script src="ui/onboarding-tour.js"></script>', '')
    
    # Check if already inlined
    if 'window.OnboardingTour = OnboardingTour;' in html:
        print("Already inlined.")
        return

    # Add it inline
    inline_tag = f'<script>\n{js_code}\n</script>\n</body>'
    html = html.replace('</body>', inline_tag)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Inlined successfully.")

inline_js('index.html')
