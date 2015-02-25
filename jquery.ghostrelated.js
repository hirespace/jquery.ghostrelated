/*!
 * @package jquery.ghostrelated
 * @version 0.2.0
 * @Copyright (C) 2014 Dane Grant (danecando@gmail.com)
 * @License MIT
 */
;(function($) {

    defaults = {
        feed: 'https://hirespace.com/london-review/rss/',
        titleClass: '.post-title',
        tagsClass: '.post-meta',
        limit: 3,
        debug: false
    }


    function RelatedPosts(element, options) {

        this.element = element;
        this.options = $.extend({}, defaults, options);

        this.parseRss();
    };

    RelatedPosts.prototype.displayPosts = function(posts) {

        var self = this,
            count = 0;

        //Let's mix these up so it's not just a chronological list
        //Evens first
        for (var i = 0; i < posts.length; i=i+2) {
            if (count == self.options.limit) break;
            $(self.element).append($('<div class="post-tile" style="height: auto;"><a style="display:block" href="' + posts[i].url + '"><div class="post-image categoryshadow" style="background:url(' + posts[i].image + ') no-repeat center center /cover;"></div><h3>' + posts[i].title + '</h3></a></div>'));
            count++;
        }

        //Then odds
        for (var i = 1; i < posts.length; i=i+2) {
            if (count == self.options.limit) break;
            $(self.element).append($('<div class="post-tile" style="height: auto;"><a style="display:block" href="' + posts[i].url + '"><div class="post-image categoryshadow" style="background:url(' + posts[i].image + ') no-repeat center center /cover;"></div><h3>' + posts[i].title + '</h3></a></div>'));
            count++;
        }

        if (count == 0) {
            $(this.element).append($('<p>No related posts were found. ' +
                'Check the <a href="/">index</a>.</p>'));
        }
    
    };

    RelatedPosts.prototype.parseRss = function() {

        var page = 1,
            prevId = '',
            feeds = [],
            self = this;

        $.ajax({
            url: this.options.feed,
            type: 'GET'
        })
        .done(function(data, textStatus, xhr) {

            var curId = $(data).find('item > guid').text();
            feeds.push(data);
            var posts = self.getPosts(feeds);
            self.displayPosts(posts);

        })
        .fail(function(e) {
            self.reportError(e);
        });

    };

    RelatedPosts.prototype.getPosts = function(feeds) {

        var posts = [], items = [], description = '', image = null;

        feeds.forEach(function(feed) {
            items = $.merge(items, $(feed).find('item'));
        });

        for (var i = 0; i < items.length; i++) {

            var item = $(items[i]);

            description = item.find('description').text();
            console.log(description);
            image = /<img\ssrc\=\"([^\"]*)\"/.exec(description);
            console.log(JSON.stringify(image));
            posts.push({
                title: item.find('title').text(),
                url: item.find('link').text(),
                content: description,
                image: image ? image[1] : '',
                tags: $.map(item.find('category'), function(elem) {
                    return $(elem).text();
                })
            });

        }

        if (posts.length < 1) {
            this.reportError("Couldn't find any posts in feed: " + feed);
        }

        return posts;
    };


    RelatedPosts.prototype.reportError = function(error) {
        if (this.options.debug) {
            $(this.element).append($('<li>' + error + '</li>'));
        }
    };


    $.fn.ghostRelated = function(options) {

        return this.each(function() {
            new RelatedPosts(this, options);
        });
    };


})(jQuery);
