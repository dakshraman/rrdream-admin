import { create } from 'zustand';

export const useModalStore = create((set) => {
    const closeAll = () => 
        set({
            isLoginOpen: false,
            isSignUpOpen: false,
            isForgetPopOpen: false,
            isAssistPopOpen: false,
            isEnquirePopOpen: false,
            isHamOpen: false,
            isVideoOpen: false,
        });
    return {
        isLoginOpen: false,
        isSignUpOpen: false,
        isForgetPopOpen: false,
        isAssistPopOpen: false,
        isEnquirePopOpen: false,
        isHamOpen: false,
        isVideoOpen: false,
        openVideo: () => {
            closeAll();
            set({ isVideoOpen: true });
        },
        closeVideo: () => set({ isVideoOpen: false }),
        openHamburger: () => {
            closeAll();
            set({ isHamOpen: true });
        },
        closeHamburger: () => set({ isHamOpen: false }),
        openLogin: () => {
            closeAll();
            set({ isLoginOpen: true });
        },
        closeLogin: () => set({ isLoginOpen: false }),

        openSignUp: () => {
            closeAll();
            set({ isSignUpOpen: true });
        },
        closeSignUp: () => set({ isSignUpOpen: false }),

        openForgetPop: () => {
            closeAll();
            set({ isForgetPopOpen: true });
        },
        closeForgetPop: () => set({ isForgetPopOpen: false }),
        openAssistPop: () => {
            closeAll();
            set({ isAssistPopOpen: true });
        },
        closeAssistPop: () => set({ isAssistPopOpen: false }),
        openEnquirePop: () => {
            closeAll();
            set({ isEnquirePopOpen: true });
        },
        closeEnquirePop: () => set({ isEnquirePopOpen: false }),

        closeAll,
    }
    
})