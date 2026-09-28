import sys

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_str = '        <!-- Overlapping Quick Quote Calculator Bar -->'
start_idx = html.find(start_str)

end_str = '    </section>'
end_idx = html.find(end_str, start_idx) + len(end_str)

original_block = html[start_idx:end_idx]

quote_content = original_block[:original_block.rfind('      </div>\n    </section>')]

new_block = '''      </div>
    </section>

    <!-- Floating quote moved here so it can overlap the bottom edge -->
    <div class="container" style="position: relative; z-index: 20;">
''' + quote_content + '''    </div>'''

new_html = html[:start_idx] + new_block + html[end_idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('Moved successfully.')
