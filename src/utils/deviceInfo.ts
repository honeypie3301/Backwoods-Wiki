export interface ClientEnvironment {
  os: string;
  browser: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  summary: string;
  osVersion?: string;
  browserVersion?: string;
}

export function detectClientEnvironment(customUserAgent?: string): ClientEnvironment {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  const ua = customUserAgent || (nav ? nav.userAgent : '') || '';
  const uaData = (nav as unknown as { userAgentData?: {
    platform?: string;
    mobile?: boolean;
    brands?: Array<{ brand: string; version: string }>;
  } })?.userAgentData;

  let os = 'Unknown OS';
  let osVersion = '';
  let browser = 'Unknown Browser';
  let browserVersion = '';
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

  // ----------------------------------------------------
  // 1. Operating System Detection
  // ----------------------------------------------------

  // iPadOS Detection (iOS 13+ iPad Safari masks as macOS desktop: "Macintosh; Intel Mac OS X 10_15_7")
  const isIpadOS = /iPad/i.test(ua) || (
    /Macintosh|Mac OS X/i.test(ua) &&
    Boolean(nav && typeof nav.maxTouchPoints === 'number' && nav.maxTouchPoints > 1)
  );

  if (isIpadOS) {
    os = 'iPadOS';
    const match = ua.match(/OS (\d+[._]\d+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/iPhone/i.test(ua)) {
    os = 'iOS';
    const match = ua.match(/OS (\d+[._]\d+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/iPod/i.test(ua)) {
    os = 'iOS (iPod)';
    const match = ua.match(/OS (\d+[._]\d+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/Windows Phone/i.test(ua)) {
    os = 'Windows Phone';
    const match = ua.match(/Windows Phone (\d+[._]\d+)/i);
    if (match) osVersion = match[1];
  } else if (/Windows/i.test(ua) || uaData?.platform === 'Windows') {
    // Windows version extraction
    if (/Windows NT 10.0/i.test(ua)) {
      // Modern Windows 11 sends Windows NT 10.0 in UA string
      // But can be verified via Client Hints or marked as modern Windows
      os = 'Windows 10/11';
    } else if (/Windows NT 6.3/i.test(ua)) {
      os = 'Windows 8.1';
    } else if (/Windows NT 6.2/i.test(ua)) {
      os = 'Windows 8';
    } else if (/Windows NT 6.1/i.test(ua)) {
      os = 'Windows 7';
    } else if (/Windows NT 6.0/i.test(ua)) {
      os = 'Windows Vista';
    } else if (/Windows NT 5.1|Windows XP/i.test(ua)) {
      os = 'Windows XP';
    } else if (/Windows NT 5.0|Windows 2000/i.test(ua)) {
      os = 'Windows 2000';
    } else {
      os = 'Windows';
    }
  } else if (/Macintosh|Mac OS X/i.test(ua) || uaData?.platform === 'macOS') {
    os = 'macOS';
    const match = ua.match(/Mac OS X (\d+[._]\d+[._]?\d*)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/HarmonyOS/i.test(ua)) {
    os = 'HarmonyOS';
  } else if (/Android/i.test(ua) || uaData?.platform === 'Android') {
    os = 'Android';
    const match = ua.match(/Android (\d+(\.\d+)*)/i);
    if (match) osVersion = match[1];
  } else if (/CrOS/i.test(ua) || uaData?.platform === 'Chrome OS') {
    os = 'ChromeOS';
  } else if (/PlayStation 5/i.test(ua)) {
    os = 'PlayStation 5';
  } else if (/PlayStation 4/i.test(ua)) {
    os = 'PlayStation 4';
  } else if (/PlayStation/i.test(ua)) {
    os = 'PlayStation';
  } else if (/Xbox/i.test(ua)) {
    if (/Xbox Series/i.test(ua)) os = 'Xbox Series X/S';
    else if (/Xbox One/i.test(ua)) os = 'Xbox One';
    else os = 'Xbox';
  } else if (/Nintendo Switch/i.test(ua)) {
    os = 'Nintendo Switch';
  } else if (/Nintendo 3DS|Nintendo WiiU/i.test(ua)) {
    os = 'Nintendo';
  } else if (/Oculus|Quest/i.test(ua)) {
    os = 'Meta Quest OS';
  } else if (/KaiOS/i.test(ua)) {
    os = 'KaiOS';
  } else if (/FreeBSD/i.test(ua)) {
    os = 'FreeBSD';
  } else if (/OpenBSD/i.test(ua)) {
    os = 'OpenBSD';
  } else if (/NetBSD/i.test(ua)) {
    os = 'NetBSD';
  } else if (/SunOS|Solaris/i.test(ua)) {
    os = 'Solaris';
  } else if (/Ubuntu/i.test(ua)) {
    os = 'Ubuntu Linux';
  } else if (/Debian/i.test(ua)) {
    os = 'Debian Linux';
  } else if (/Fedora/i.test(ua)) {
    os = 'Fedora Linux';
  } else if (/Arch/i.test(ua)) {
    os = 'Arch Linux';
  } else if (/Manjaro/i.test(ua)) {
    os = 'Manjaro Linux';
  } else if (/Mint/i.test(ua)) {
    os = 'Linux Mint';
  } else if (/CentOS/i.test(ua)) {
    os = 'CentOS';
  } else if (/Red Hat|RHEL/i.test(ua)) {
    os = 'Red Hat Linux';
  } else if (/SUSE/i.test(ua)) {
    os = 'SUSE Linux';
  } else if (/Linux/i.test(ua) || uaData?.platform === 'Linux') {
    os = 'Linux';
  }

  // ----------------------------------------------------
  // 2. Browser Detection
  // (Order is strictly ordered from high specificity to generic Chromium/WebKit engines)
  // ----------------------------------------------------

  // Brave Check (Brave omits 'Brave' from UA in modern versions to combat fingerprinting)
  const isBrave = Boolean(
    (nav as unknown as { brave?: { isBrave?: () => Promise<boolean> | boolean } })?.brave !== undefined ||
    /Brave/i.test(ua) ||
    uaData?.brands?.some(b => b.brand === 'Brave')
  );

  if (isBrave) {
    browser = 'Brave';
  } else if (/Arc\//i.test(ua)) {
    browser = 'Arc';
    const match = ua.match(/Arc\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/SamsungBrowser\//i.test(ua)) {
    browser = 'Samsung Internet';
    const match = ua.match(/SamsungBrowser\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/DuckDuckGo\//i.test(ua) || /DDB\//i.test(ua)) {
    browser = 'DuckDuckGo';
  } else if (/Opera GX|OPR\/.*GX/i.test(ua)) {
    browser = 'Opera GX';
    const match = ua.match(/OPR\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/OPR\/|Opera/i.test(ua) || /OPT\/|OPiOS\//i.test(ua)) {
    browser = 'Opera';
    const match = ua.match(/(?:OPR|Opera|OPT|OPiOS)[\/ ](\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/Edg\/|Edge\/|EdgA\/|EdgiOS\//i.test(ua)) {
    browser = 'Edge';
    const match = ua.match(/(?:Edg|Edge|EdgA|EdgiOS)\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/Vivaldi\//i.test(ua)) {
    browser = 'Vivaldi';
    const match = ua.match(/Vivaldi\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/YaBrowser\//i.test(ua)) {
    browser = 'Yandex Browser';
    const match = ua.match(/YaBrowser\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/UCBrowser\//i.test(ua) || /UBrowser\//i.test(ua)) {
    browser = 'UC Browser';
    const match = ua.match(/(?:UCBrowser|UBrowser)\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/MiuiBrowser\//i.test(ua)) {
    browser = 'Miui Browser';
    const match = ua.match(/MiuiBrowser\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/HuaweiBrowser\//i.test(ua)) {
    browser = 'Huawei Browser';
    const match = ua.match(/HuaweiBrowser\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/MicroMessenger\//i.test(ua)) {
    browser = 'WeChat';
  } else if (/QQBrowser|MQQBrowser/i.test(ua)) {
    browser = 'QQ Browser';
  } else if (/Whale\//i.test(ua)) {
    browser = 'Naver Whale';
    const match = ua.match(/Whale\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/TorBrowser|Tor\//i.test(ua)) {
    browser = 'Tor Browser';
  } else if (/Waterfox\//i.test(ua)) {
    browser = 'Waterfox';
  } else if (/PaleMoon\//i.test(ua)) {
    browser = 'Pale Moon';
  } else if (/SeaMonkey\//i.test(ua)) {
    browser = 'SeaMonkey';
  } else if (/FxiOS\//i.test(ua)) {
    browser = 'Firefox';
    const match = ua.match(/FxiOS\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/CriOS\//i.test(ua)) {
    browser = 'Chrome';
    const match = ua.match(/CriOS\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/Chromium\//i.test(ua)) {
    browser = 'Chromium';
    const match = ua.match(/Chromium\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/HeadlessChrome/i.test(ua)) {
    browser = 'Headless Chrome';
  } else if (/Safari\//i.test(ua) && !/Chrome|CriOS|Android/i.test(ua)) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  } else if (/MSIE|Trident/i.test(ua)) {
    browser = 'Internet Explorer';
    const match = ua.match(/(?:MSIE |rv:)(\d+(\.\d+)*)/i);
    if (match) browserVersion = match[1];
  }

  // ----------------------------------------------------
  // 3. Device Form Factor
  // ----------------------------------------------------
  if (
    isIpadOS ||
    /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) ||
    /Nexus (7|9|10)|SM-T|Galaxy Tab/i.test(ua)
  ) {
    deviceType = 'Tablet';
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|KaiOS|webOS/i.test(ua) ||
    uaData?.mobile === true
  ) {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Desktop';
  }

  const osDisplay = osVersion ? `${os} ${osVersion.split('.')[0]}` : os;
  const browserDisplay = browserVersion ? `${browser} ${browserVersion.split('.')[0]}` : browser;

  return {
    os,
    browser,
    deviceType,
    summary: `${browserDisplay} · ${osDisplay}`,
    osVersion,
    browserVersion
  };
}
