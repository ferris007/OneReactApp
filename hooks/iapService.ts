import * as RNIap from 'react-native-iap';
import { Linking, Platform } from 'react-native';

export const subscriptionSkus = ['1aiagent001']; // replace with yours

export async function initIAP() {
  try {
    await RNIap.initConnection();
    const availableSubs = await RNIap.getSubscriptions({ skus: subscriptionSkus });
    console.log('[IAP] initIAP: requested SKUs =', subscriptionSkus);
    console.log('[IAP] initIAP: available subscriptions count =', availableSubs?.length ?? 0);
    availableSubs?.forEach((s, idx) => {
      console.log(`[IAP]   sub[${idx}] sku=${s.productId} title=${s.title}`);
    });
    return availableSubs;
  } catch (err) {
    console.error('IAP init error:', err);
    return [];
  }
}

export async function requestSubscription(sku: string) {
  try {
    const result = await RNIap.requestSubscription({ sku });
    console.log('Subscription request successful:', result);
    
    return result;
  } catch (err) {
    console.error('Subscription request error:', err);
    throw err; // Re-throw so the UI can handle the error
  }
}

export async function getActiveSubscription() {
  try {
    // Ensure IAP connection is established before querying purchases
    try {
      await RNIap.initConnection();
    } catch (initErr) {
      console.warn('IAP connection not initialized; attempting to continue. Error:', initErr);
    }
    const purchases = await RNIap.getAvailablePurchases();
    console.log("PURCHASES", purchases);

    console.log('[IAP] getActiveSubscription: total purchases =', purchases?.length ?? 0);
    purchases?.forEach((p, idx) => {
      const hasReceipt = !!p.transactionReceipt;
      const isSubSku = subscriptionSkus.includes(p.productId);
      console.log(`[IAP]   purchase[${idx}] sku=${p.productId} hasReceipt=${hasReceipt} matchesSubscriptionSku=${isSubSku}`);
    });
    const activeSub = purchases.find(
      (p) => subscriptionSkus.includes(p.productId) && p.transactionReceipt
    );
    if (activeSub) {
      console.log('[IAP] getActiveSubscription: ACTIVE subscription found for sku=', activeSub.productId);
    } else {
      console.log('[IAP] getActiveSubscription: No active subscription found for skus=', subscriptionSkus);
    }
    return activeSub || null;
  } catch (err) {
    console.error('Get active subscription error:', err);
    return null;
  }
}

export function setupPurchaseListener(onPurchaseSuccess?: (purchase: any) => void, onPurchaseError?: (error: any) => void) {
  const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
    (purchase) => {
      console.log('Purchase successful:', purchase);
      onPurchaseSuccess?.(purchase);
    }
  );

  const purchaseErrorSubscription = RNIap.purchaseErrorListener(
    (error) => {
      console.log('Purchase error:', error);
      onPurchaseError?.(error);
    }
  );

  return () => {
    purchaseUpdateSubscription?.remove();
    purchaseErrorSubscription?.remove();
  };
}

export async function endConnection() {
  try {
    await RNIap.endConnection();
  } catch (err) {
    console.error('End connection error:', err);
  }
}

// Opens the platform's native subscription management page so users can cancel.
// Note: App Store and Google Play do not allow programmatic cancellation; users must manage it themselves.
export async function openManageSubscriptions(productId?: string) {
  const activeSubs = await getActiveSubscription();
  console.log('[IAP] openManageSubscriptions: activeSub sku=', activeSubs?.productId ?? 'none');

  try {
    if (Platform.OS === 'ios') {
      // Apple: opens the Subscriptions page in App Store
      await Linking.openURL('itms-apps://apps.apple.com/account/subscriptions');
      return;
    }

    // Android: open the Google Play subscriptions center. Optionally include SKU and let Play filter.
    // If you know your packageName, you can append: &package=your.package
    const baseUrl = 'https://play.google.com/store/account/subscriptions';
    const url = productId ? `${baseUrl}?sku=${encodeURIComponent(productId)}` : baseUrl;
    await Linking.openURL(url);
  } catch (err) {
    console.error('Open manage subscriptions error:', err);
    throw err;
  }
}

// Optional debug helper to dump current IAP state to logs
export async function debugIapState() {
  try {
    console.log('[IAP] debugIapState: start');
    await RNIap.initConnection();
    console.log('[IAP] debugIapState: connection initialized');
    const subs = await RNIap.getSubscriptions({ skus: subscriptionSkus });
    console.log('[IAP] debugIapState: subscriptions count =', subs?.length ?? 0);
    subs?.forEach((s, idx) => console.log(`[IAP]   sub[${idx}] sku=${s.productId}`));
    const purchases = await RNIap.getAvailablePurchases();
    console.log('[IAP] debugIapState: purchases count =', purchases?.length ?? 0);
    purchases?.forEach((p, idx) => console.log(`[IAP]   purchase[${idx}] sku=${p.productId} hasReceipt=${!!p.transactionReceipt}`));
    const active = await getActiveSubscription();
    console.log('[IAP] debugIapState: active=', active ? active.productId : 'none');
  } catch (e) {
    console.error('[IAP] debugIapState error:', e);
  }
}
