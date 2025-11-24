import { useEffect } from 'react';

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

export const useFacebookSDK = () => {
    useEffect(() => {
        const appId = import.meta.env.VITE_FACEBOOK_APP_ID || '1445435480638483';

        if (!appId) {
            console.warn('Facebook App ID not found. SDK will not initialize.');
            return;
        }

        if (window.FB) {
            // If already loaded, dispatch ready event again for late subscribers
            window.dispatchEvent(new Event('facebook-sdk-ready'));
            return;
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: appId,
                cookie: true,
                xfbml: true,
                version: 'v19.0'
            });

            console.log('Facebook SDK initialized');
            window.FB.AppEvents.logPageView();

            window.FB.getLoginStatus(function (response: any) {
                console.log('Facebook Login Status:', response);
                if (response.status === 'connected') {
                    console.log('User is connected to Facebook and authenticated with the app.');
                } else if (response.status === 'not_authorized') {
                    console.log('User is logged into Facebook but not authorized for the app.');
                } else {
                    console.log('User is not logged into Facebook.');
                }
            });

            // Dispatch event to notify that SDK is ready
            window.dispatchEvent(new Event('facebook-sdk-ready'));
        };

        // Load the SDK asynchronously
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s) as HTMLScriptElement;
            js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            if (fjs && fjs.parentNode) {
                fjs.parentNode.insertBefore(js, fjs);
            } else {
                d.head.appendChild(js);
            }
        }(document, 'script', 'facebook-jssdk'));
    }, []);
};
