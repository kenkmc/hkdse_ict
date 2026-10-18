(function () {
  'use strict';
  const file = location.pathname.split('/').pop().replace(/\.html$/,'');
  const mapping = {
    'chb.1':'chb-1','chb.2':'chb-1','chb.3':'chb-2',
    'chc.5':'chc-5','chc.6':'chc-5',
    'chd.1':'chd-1','chd.2':'chd-2','chd.3':'chd-2','chd.4':'chd-3','chd.5':'chd-3','chd.6':'chd-4',
    'eleca.1':'ea-1','eleca.2':'ea-2','eleca.3':'ea-2','eleca.4':'ea-3','eleca.5':'ea-3',
    'elecb.1':'eb-1','elecb.2':'eb-1','elecb.3':'eb-2','elecb.4':'eb-2','elecb.5':'eb-2',
    'elecc.1':'ec-1','elecc.2':'ec-1','elecc.3':'ec-1','elecc.4':'ec-1','elecc.5':'ec-1','elecc.6':'ec-1','elecc.7':'ec-1','elecc.8':'ec-2',
    'sba.1':'tool-sba-prep','db_simulator':'ea-2','pki_animation':'chc-5','python_converter':'chd-3'
  };
  const id = mapping[file] || (/^(cha|chc|che)\.[1-5]$/.test(file) ? file.replace('.','-') : '');
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label','課程與工具導覽');
  nav.style.cssText='display:flex;flex-wrap:wrap;gap:1rem;padding:.7rem 1rem;background:#123d6a;color:white;font:14px/1.6 system-ui;position:relative;z-index:60';
  [['../index.html','← 主站課程與工具'],['index.html','分課目錄'],['../course-manual/index.html'+(id?'?unit='+id:''),id?'本課課文與教學':'課文與教學'],['../practice.html','DSE練習'],['../progress.html','我的學習'],['../updates/index.html','更新紀錄']].forEach(([href,text])=>{
    const a=document.createElement('a');a.href=href;a.textContent=text;a.style.cssText='color:white;text-decoration:underline;min-height:30px;display:inline-flex;align-items:center';nav.append(a);
  });
  document.body.prepend(nav);
})();
