import os

directory = r'c:\Users\furbg\Desktop\halisaha\backend\src\test\java'

for root, _, files in os.walk(directory):
    for filename in files:
        if filename.endswith('.java'):
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'Reservation.builder()' in content and 'Reservation.builder().gameType("FOOTBALL")' not in content:
                content = content.replace('Reservation.builder()', 'Reservation.builder().gameType("FOOTBALL")')
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
print("done")
