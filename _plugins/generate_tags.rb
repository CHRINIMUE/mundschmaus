module Jekyll
  class TagPage < Page
    def initialize(site, base, dir, tag)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'tag.html')
      self.data['tag'] = tag
      self.data['title'] = "Posts tagged: #{tag}"
    end
  end

  class TagPageGenerator < Generator
    safe true

    def generate(site)
      if site.layouts.key? 'tag'
        # Collect tags from the 'recipe' collection
        tags = Hash.new { |hash, key| hash[key] = [] }
        site.collections['recipes'].docs.each do |recipe|
          next unless recipe.data['tags']
          recipe.data['tags'].each do |tag|
            # Clean up and store the tag
            cleaned_tag = Jekyll::Utils.slugify(tag.strip)
            tags[cleaned_tag] << recipe
          end
        end

        # Generate tag pages
        tags.each do |tag, recipes|
          site.pages << TagPage.new(site, site.source, File.join('tags', tag), tag)
        end
      end
    end
  end
end
