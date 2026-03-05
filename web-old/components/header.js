export function createHeader() {
    const header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML = `
        <div class="header-logo">IMPERIUM</div>
        <nav class="header-nav">
            <button class="nav-btn" onclick="navigateTo('home')">Home</button>
            <button class="nav-btn" onclick="navigateTo('progress')">Progress</button>
            <button class="nav-btn" onclick="navigateTo('profile')">Profile</button>
        </nav>
    `;
    return header;
}

export function navigateTo(page) {
    console.log('Navigating to:', page);
}

export function initComponents() {
    console.log('Components initialized');
}
