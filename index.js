'use strict';

import * as fetch from './lib/fetch.js';

export default async function(source, options = {}, useString = false) {
  let _res = source;
  if (!useString) {
    _res = await fetch(source, options);
    if (_res.status != 200) return null;
    if (_res.content.toLowerCase().includes("<html")) return null;
  }
  let _content = _res.content
    .split(/\r?\n/)
    .filter(row => row.match(/^[ -~]+$/gim))
    .join("\r\n");
  let _sitemaps = [];
  let _agents = [];
  let _groups = {};
  let _crawldelay = null;
  let _host = null;
  _getGroups();
  function _getGroups() {
    let currentGroup = "";
    let unsortedGroups = _content
      .split(/\r?\n/)
      .filter(row => row.trim().match(/^(Allow|Disallow|User-agent).*/gim))
      .reduce((acc, cur) => {
        if (cur.indexOf(":") == -1) return acc;
        const key = cur
          .split(":")[0]
          .replace(/(\s?-\s)/g, "")
          .toLowerCase()
          .trim();
        const value = cur
          .split(":")[1]
          .replace(/(\s?-\s)/g, "")
          .trim();

        if (
          key == "user-agent" &&
          value != "" &&
          !acc.hasOwnProperty(value.toLowerCase())
        )
          acc[value.toLowerCase()] = [];

        if (key == "user-agent") currentGroup = value.toLowerCase();
        try {
          if (key != "user-agent" && value != "" && currentGroup != "") {
            acc[currentGroup].push({ directive: key, path: value });
          }
        } catch (e) {
          console.log(e);
        }
        return acc;
      }, {});
    _groups = unsortedGroups;
    _agents = Object.keys(_groups).sort();
  }

  return {
    isAllowed: function(path, agent) {
      let allowed = true;

      let activeGroup = _agents
        .filter(_agent => {
          if (agent.toLowerCase().indexOf(_agent) != -1) return true;
        })
        .reduce((acc, cur) => {
          if (acc.length < cur.length) acc = cur;
          return acc;
        }, "*");

      const g = _groups[activeGroup] || [];

      const rules = g.sort(function(a, b) {
        return a.path.length - b.path.length;
      });

      for (let rule of rules) {
        if (rule.path.trim().length == 0) continue;
        if (rule.path == "/") rule.path = "/*";

        const pattern = rule.path
          .replace(/\//gim, "\\/")
          .replace(/\?/, "\\?")
          .replace(/\*/gim, ".*");
        try {
          const reg = new RegExp(pattern, "ig");

          if (path.match(reg) && rule.directive == "disallow") allowed = false;
          if (path.match(reg) && rule.directive == "allow") allowed = true;
        } catch (e) {}
      }

      return allowed;
    },
    getGroups: function() {
      return _groups;
    },
    getAgents: function() {
      return _agents;
    },
    getContents: function() {
      return _content;
    },
    getSitemaps: function() {
      const reg = /Sitemap: *([^\r\n]*)/gi;
      let match = reg.exec(_content);

      while (match != null) {
        _sitemaps.push(match[1]);
        match = reg.exec(_content);
      }
      return _sitemaps;
    },
    getCrawlDelay: function(max = 60) {
      const reg = /crawl-delay: *([^\r\n]*)/gi;
      let match = reg.exec(_content);
      if (match) {
        _crawldelay = parseInt(match[1]) > max ? max : parseInt(match[1]);
      }
      return _crawldelay;
    },
    getHost: function() {
      const reg = /host: *([^\r\n]*)/gi;
      let match = reg.exec(_content);
      if (match) _host = match[1];
      return _host;
    }
  };
};
