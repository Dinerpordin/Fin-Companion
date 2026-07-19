import docx

def read_docx(file_path):
    try:
        doc = docx.Document(file_path)
        lines = [p.text for p in doc.paragraphs if p.text.strip()]
        
        with open("spec_output.txt", "w", encoding="utf-8") as f:
            for i, line in enumerate(lines):
                if "Phase 2" in line or "Phase II" in line or "Phase" in line:
                    start = max(0, i - 2)
                    end = min(len(lines), i + 10)
                    f.write(f"--- MATCH found at {i} ---\n")
                    for j in range(start, end):
                        f.write(lines[j] + "\n")
                    f.write("--------------------------\n")
    except Exception as e:
        print(f"Error reading docx: {e}")

read_docx("AI Financial Companion Module — Bangladesh FinTech Platform.docx")
