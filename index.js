const fetch = require("./lib/fetch");
module.exports = async function(url, options = {}) {
  var _res = await fetch(url);
  if (_res.status != 200) return null;
  var _content = _res.content;
  var _sitemaps = [];
  var _agents = [];
  var _groups = {};
  var _crawldelay = null;
  var _host = null;
  _getGroups();
  function _getGroups() {
    var currentGroup = "";
    var unsortedGroups = _res.content
      .split(/\r?\n/)
      .filter(row => row.match(/^(Allow|Disallow|User-agent).*/gim))
      .reduce((acc, cur) => {
        const key = cur
          .split(":")[0]
          .replace(/(\s?-\s)/g, "")
          .toLowerCase()
          .trim();
        const value = cur
          .split(":")[1]
          .replace(/(\s?-\s)/g, "")
          .trim();

        if (key == "user-agent" && !acc.hasOwnProperty(value.toLowerCase()))
          acc[value.toLowerCase()] = [];

        if (key == "user-agent") currentGroup = value.toLowerCase();
        if (key != "user-agent")
          acc[currentGroup].push({ field: key, path: value });

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

      const rules = _groups[activeGroup].sort(function(a, b) {
        return a.path.length - b.path.length;
      });

      for (let rule of rules) {
        if (rule.path.trim().length == 0) continue;
        if (rule.path == "/") rule.path = "/*";
        const pattern = rule.path
          .replace(/\//gim, "\\/")
          .replace(/\*/gim, ".+");
        const reg = new RegExp(pattern, "ig");

        if (path.match(reg) && rule.field == "disallow") allowed = false;
        if (path.match(reg) && rule.field == "allow") allowed = true;
      }

      return allowed;
    },
    getGroups: function() {
      return _groups;
    },
    getAgents: function() {
      return _agents;
    },
    getSitemaps: function() {
      const reg = /Sitemap: *([^\r\n]*)/gi;
      var match = reg.exec(_content);

      while (match != null) {
        _sitemaps.push(match[1]);
        match = reg.exec(_content);
      }
      return _sitemaps;
    },
    getCrawlDelay: function() {
      const reg = /crawl-delay: *([^\r\n]*)/gi;
      var match = reg.exec(_content);
      if (match) _crawldelay = match[1];
      return _crawldelay;
    },
    getHost: function() {
      const reg = /host: *([^\r\n]*)/gi;
      var match = reg.exec(_content);
      if (match) _host = match[1];
      return _host;
    }
  };
};
