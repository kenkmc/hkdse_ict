(function () {
  'use strict';
  const at = (sim, target, position = 'append') => ({ sim, target, position });
  const core1 = [at('network-request-topology', '#services'), at('lan-switch-router', '#hardware'), at('wifi-roaming-floor', '#connections')];
  const core2 = [at('dns-tcp-packets', '#tcpip'), at('ip-address-bits', '#ip'), at('dns-cache-resolution', '#dns'), at('url-component-inspector', '#url')];
  Object.assign(window.ICT_LESSON_PLANS ||= {}, {
    'chc.1': core1,
    'chc.2': core2,
    'chc.3': [at('stream-buffer-tank', '#streaming'), at('cloud-sensor-pipeline', '#streaming')],
    'chc.4': [at('html-dom-tree', '#html'), at('publish-resource-paths', '#publish')],
    'chc.5': [at('malware-spread-map', '#threats'), at('security-firewall-gates', '#defences'), at('crypto-signature-workbench', '#encryption'), at('certificate-trust-check', '#transactions')],
    'eb.1': [at('network-request-topology', '#request'), at('http-wire-inspector', '#request'), at('dhcp-lease-and-sharing', '#services'), at('sharing-permission-matrix', '#implementation')],
    'eb.2': [at('html-dom-tree', '#layers'), at('css-cascade-live', '#layers'), at('webapp-request-lifecycle', '#validation'), at('cookie-session-store', '#state')],
    'pki_animation': [],
    'animations/chc.1': [at('network-request-topology', '#s2'), at('lan-switch-router', '#s3'), at('wifi-roaming-floor', '#links')],
    'animations/chc.2': core2,
    'animations/chc.3': [at('search-evidence-filter', '#search'), at('stream-buffer-tank', '#stream'), at('cloud-sensor-pipeline', '#stream')],
    'animations/chc.4': [at('html-dom-tree', '#html'), at('publish-resource-paths', '#publish')],
    'animations/chc.5': [at('malware-spread-map', '#malware'), at('security-firewall-gates', '#privacy')],
    'animations/chc.6': [at('security-firewall-gates', '#layers'), at('crypto-signature-workbench', '#pki'), at('certificate-trust-check', '#pki')],
    'animations/elecb.1': [at('network-request-topology', '#request'), at('http-wire-inspector', '#methods')],
    'animations/elecb.2': [at('dhcp-lease-and-sharing', '#services'), at('wifi-roaming-floor', '#services'), at('sharing-permission-matrix', '#permissions')],
    'animations/elecb.3': [at('css-cascade-live', '#css'), at('publish-resource-paths', '#publishing')],
    'animations/elecb.4': [at('webapp-request-lifecycle', '#validation'), at('cookie-session-store', '#cookies')],
    'animations/elecb.5': [at('webapp-request-lifecycle', '#integration'), at('publish-resource-paths', '#evaluation')],
    'animations/pki_animation': []
  });
})();
