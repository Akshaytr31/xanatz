import os
import re
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Group, Polygon
from reportlab.pdfgen import canvas

# --- NumberedCanvas for professional "Page X of Y" layout ---
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        if self._pageNumber == 1:
            # Suppress header and footer on the cover page
            return
            
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header
        self.drawString(54, 72 * 11 - 36, "XANATZ - Project Documentation")
        self.drawRightString(72 * 8.5 - 54, 72 * 11 - 36, "Project Documentation Index")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 72 * 11 - 42, 72 * 8.5 - 54, 72 * 11 - 42)
        
        # Footer
        self.drawString(54, 36, "Confidential - Academic & System Reference Document")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(72 * 8.5 - 54, 36, page_text)
        self.line(54, 48, 72 * 8.5 - 54, 48)
        
        self.restoreState()


# --- Parsing Models ---
def parse_models(models_path):
    if not os.path.exists(models_path):
        print(f"Error: Models path not found at {models_path}")
        return []
        
    with open(models_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    classes = []
    # Split the file by class declarations at the start of a line
    class_blocks = re.split(r"^class\s+", content, flags=re.MULTILINE)
    
    for block in class_blocks[1:]:
        lines = block.split("\n")
        header_line = lines[0]
        header_match = re.match(r"^(\w+)\((.+)\):", header_line.strip())
        if not header_match:
            continue
            
        name = header_match.group(1)
        parent = header_match.group(2)
        if name in ["UserManager", "BaseUserManager"]:
            continue
            
        current_class = {
            "name": name,
            "parent": parent,
            "fields": [],
            "choices": {},
            "properties": [],
            "methods": [],
            "class_vars": [],
            "meta": {}
        }
        
        # Add implicit primary key 'id'
        current_class["fields"].append({
            "name": "id",
            "type": "AutoField",
            "max_length": None,
            "nullable": False,
            "unique": True,
            "default": None,
            "raw_args": "primary_key=True"
        })
        
        in_meta = False
        current_choice_name = None
        current_choice_lines = []
        next_is_property = False
        
        for line in lines[1:]:
            line_raw = line
            stripped = line.strip()
            if not stripped:
                continue
                
            indent = len(line_raw) - len(line_raw.lstrip())
            
            # Check properties decorator
            if stripped == "@property":
                next_is_property = True
                continue
                
            # Check Meta block
            if stripped.startswith("class Meta:"):
                in_meta = True
                continue
            elif in_meta and indent == 4:
                in_meta = False
            elif in_meta and indent == 8:
                meta_v_match = re.match(r"^(\w+)\s*=\s*(.*)", stripped)
                if meta_v_match:
                    current_class["meta"][meta_v_match.group(1)] = meta_v_match.group(2)
                continue
                
            # Check Choices block (e.g. ROLE_CHOICES = [...])
            if "_CHOICES" in stripped and "=" in stripped:
                choice_match = re.match(r"^(\w+_CHOICES)\s*=\s*\[(.*)\]", stripped)
                if choice_match:
                    c_name = choice_match.group(1)
                    c_val = choice_match.group(2)
                    tuples = re.findall(r"\(([^)]+)\)", c_val)
                    opts = []
                    for t in tuples:
                        parts = [p.strip().strip("'").strip('"') for p in t.split(",")]
                        if len(parts) >= 2:
                            opts.append(f"{parts[0]}: {parts[1]}")
                    current_class["choices"][c_name] = opts
                    continue
                else:
                    choice_start_match = re.match(r"^(\w+_CHOICES)\s*=\s*\[", stripped)
                    if choice_start_match:
                        current_choice_name = choice_start_match.group(1)
                        current_choice_lines = []
                        continue
            
            if current_choice_name:
                if "]" in stripped:
                    before_bracket = stripped.split("]")[0].strip()
                    if before_bracket:
                        current_choice_lines.append(before_bracket)
                    full_val = " ".join(current_choice_lines)
                    tuples = re.findall(r"\(([^)]+)\)", full_val)
                    opts = []
                    for t in tuples:
                        parts = [p.strip().strip("'").strip('"') for p in t.split(",")]
                        if len(parts) >= 2:
                            opts.append(f"{parts[0]}: {parts[1]}")
                    current_class["choices"][current_choice_name] = opts
                    current_choice_name = None
                else:
                    current_choice_lines.append(stripped)
                continue
                
            if indent > 4:
                continue
                
            # Check methods
            if stripped.startswith("def "):
                method_match = re.match(r"^def\s+(\w+)\((.*?)\):", stripped)
                if method_match:
                    m_name = method_match.group(1)
                    m_args = method_match.group(2)
                    if next_is_property:
                        current_class["properties"].append(m_name)
                    else:
                        current_class["methods"].append(f"{m_name}({m_args})")
                next_is_property = False
                continue
                
            # Reset property decorator flag if this line is something else
            next_is_property = False
            
            # Check fields
            field_match = re.match(r"^(\w+)\s*=\s*models\.(\w+)\((.*)\)", stripped)
                
            if field_match:
                f_name = field_match.group(1)
                f_type = field_match.group(2)
                f_args = field_match.group(3)
                
                # Exclude internal variables/properties
                if f_type in ["CharField", "TextField", "IntegerField", "PositiveIntegerField", "DecimalField",
                              "BooleanField", "DateTimeField", "DateField", "EmailField", "URLField", "JSONField",
                              "ImageField", "FileField", "ForeignKey", "OneToOneField", "ManyToManyField", "UUIDField"]:
                    
                    max_length = None
                    ml_match = re.search(r"max_length\s*=\s*(\d+)", f_args)
                    if ml_match:
                        max_length = int(ml_match.group(1))
                        
                    nullable = "null=True" in f_args or "blank=True" in f_args
                    unique = "unique=True" in f_args
                    default_val = None
                    default_match = re.search(r"default\s*=\s*([^,\s)]+)", f_args)
                    if default_match:
                        default_val = default_match.group(1)
                        
                    # In MySQL database, ForeignKey and OneToOneField fields are stored with _id suffix
                    db_name = f_name
                    if f_type in ["ForeignKey", "OneToOneField"]:
                        db_name = f"{f_name}_id"
                        
                    current_class["fields"].append({
                        "name": db_name,
                        "type": f_type,
                        "max_length": max_length,
                        "nullable": nullable,
                        "unique": unique,
                        "default": default_val,
                        "raw_args": f_args
                    })
            else:
                # Class variable (e.g. username = None or USERNAME_FIELD = 'email')
                var_match = re.match(r"^(\w+)\s*=\s*(.*)", stripped)
                if var_match:
                    v_name = var_match.group(1)
                    v_val = var_match.group(2)
                    if v_name not in ["objects"] and not v_name.endswith("_CHOICES"):
                        current_class["class_vars"].append((v_name, v_val))
                        
        classes.append(current_class)
        
    # Post-process User model to include AbstractUser inherited fields
    for cls in classes:
        if cls["name"] == "User":
            inherited_fields = [
                {"name": "password", "type": "CharField", "max_length": 128, "nullable": False, "unique": False, "default": None, "raw_args": ""},
                {"name": "last_login", "type": "DateTimeField", "max_length": None, "nullable": True, "unique": False, "default": None, "raw_args": ""},
                {"name": "is_superuser", "type": "BooleanField", "max_length": None, "nullable": False, "unique": False, "default": "False", "raw_args": ""},
                {"name": "first_name", "type": "CharField", "max_length": 150, "nullable": True, "unique": False, "default": None, "raw_args": ""},
                {"name": "last_name", "type": "CharField", "max_length": 150, "nullable": True, "unique": False, "default": None, "raw_args": ""},
                {"name": "is_staff", "type": "BooleanField", "max_length": None, "nullable": False, "unique": False, "default": "False", "raw_args": ""},
                {"name": "is_active", "type": "BooleanField", "max_length": None, "nullable": False, "unique": False, "default": "True", "raw_args": ""},
                {"name": "date_joined", "type": "DateTimeField", "max_length": None, "nullable": False, "unique": False, "default": "timezone.now", "raw_args": ""},
            ]
            
            existing = cls["fields"]
            combined = [existing[0]] # id is index 0
            
            for inf in inherited_fields:
                if not any(f["name"] == inf["name"] for f in existing):
                    combined.append(inf)
            for f in existing[1:]:
                combined.append(f)
            cls["fields"] = combined
            
    return classes


# --- Dynamic SQL Schema Generator ---
def generate_sql_schema(parsed_classes):
    sql_statements = []
    
    # Simple map of Django field types to MySQL equivalents
    type_map = {
        "AutoField": "INT UNSIGNED AUTO_INCREMENT",
        "CharField": "VARCHAR",
        "TextField": "TEXT",
        "IntegerField": "INT",
        "PositiveIntegerField": "INT UNSIGNED",
        "DecimalField": "DECIMAL",
        "BooleanField": "TINYINT(1)",
        "DateTimeField": "DATETIME",
        "DateField": "DATE",
        "EmailField": "VARCHAR(254)",
        "URLField": "VARCHAR(200)",
        "JSONField": "JSON",
        "UUIDField": "CHAR(36)",
        "ImageField": "VARCHAR(100)",
        "FileField": "VARCHAR(100)",
        "ForeignKey": "INT UNSIGNED",
        "OneToOneField": "INT UNSIGNED",
    }
    
    for cls in parsed_classes:
        table_name = f"accounts_{cls['name'].lower()}"
        lines = []
        lines.append(f"CREATE TABLE `{table_name}` (")
        
        # Primary key ID is generated explicitly in the loop now, or handled
        # Let's just generate fields from cls["fields"] but special-case the id field
        fk_constraints = []
        
        for f in cls["fields"]:
            # Skip ManyToManyField since it represents a junction table
            if f["type"] == "ManyToManyField":
                continue
                
            col_name = f"`{f['name']}`"
            col_type = type_map.get(f["type"], "VARCHAR")
            
            # Special case primary key ID
            if f["name"] == "id":
                lines.append("  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,")
                continue
                
            # Type refinement
            if col_type == "VARCHAR" and f["max_length"]:
                col_type = f"VARCHAR({f['max_length']})"
            elif col_type == "VARCHAR":
                col_type = "VARCHAR(255)"
            elif col_type == "DECIMAL":
                # Find digits
                digits = "10,2"
                d_match = re.search(r"max_digits\s*=\s*(\d+)", f["raw_args"])
                dp_match = re.search(r"decimal_places\s*=\s*(\d+)", f["raw_args"])
                if d_match and dp_match:
                    digits = f"{d_match.group(1)},{dp_match.group(1)}"
                col_type = f"DECIMAL({digits})"
                
            null_clause = "NULL" if f["nullable"] else "NOT NULL"
            unique_clause = " UNIQUE" if f["unique"] else ""
            default_clause = ""
            if f["default"] is not None:
                default_val = f["default"].replace("'", "`").replace('"', '`')
                if default_val not in ["list", "dict", "datetime.timedelta", "timezone.now"]:
                    default_clause = f" DEFAULT {default_val}"
                    
            lines.append(f"  {col_name} {col_type} {null_clause}{unique_clause}{default_clause},")
            
            # Foreign Key setup
            if f["type"] in ["ForeignKey", "OneToOneField"]:
                # Try to extract target class
                target = "User"
                args = f["raw_args"].split(",")
                if args:
                    first_arg = args[0].strip()
                    if "'" in first_arg or '"' in first_arg:
                        target = first_arg.replace("'", "").replace('"', '')
                    else:
                        target = first_arg
                
                target_table = f"accounts_{target.lower()}"
                if target == "User":
                    target_table = "accounts_user"
                
                # Strip _id suffix for DB lookup constraint if needed
                col_ref_name = f["name"]
                fk_constraints.append(
                    f"  CONSTRAINT `fk_{table_name}_{col_ref_name}` FOREIGN KEY (`{col_ref_name}`) REFERENCES `{target_table}` (`id`) ON DELETE CASCADE"
                )
                
        # Append FK constraints
        for fk in fk_constraints:
            lines.append(fk + ",")
            
        # Clean trailing comma from last item
        if lines[-1].endswith(","):
            lines[-1] = lines[-1][:-1]
            
        lines.append(");")
        sql_statements.append("\n".join(lines))
        
    return sql_statements



# --- Drawings / Vector Diagrams ---
def draw_system_architecture():
    d = Drawing(460, 110)
    # Background card
    d.add(Rect(0, 0, 460, 110, fillColor=colors.HexColor("#f8fafc"), strokeColor=colors.HexColor("#cbd5e1"), strokeWidth=1, rx=8, ry=8))
    
    # React UI Block
    d.add(Rect(15, 20, 110, 60, fillColor=colors.HexColor("#2563eb"), strokeColor=colors.HexColor("#1d4ed8"), rx=6, ry=6))
    d.add(String(70, 52, "React Frontend", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white, textAnchor="middle"))
    d.add(String(70, 38, "Client Layer", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#93c5fd"), textAnchor="middle"))
    
    # Arrow 1 (React to DRF)
    d.add(Line(125, 50, 175, 50, strokeColor=colors.HexColor("#64748b"), strokeWidth=1.5))
    d.add(Polygon([175, 50, 168, 54, 168, 46], fillColor=colors.HexColor("#64748b"), strokeColor=None))
    d.add(String(150, 55, "REST API", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#475569"), textAnchor="middle"))
    
    # Django REST API Block
    d.add(Rect(175, 20, 120, 60, fillColor=colors.HexColor("#059669"), strokeColor=colors.HexColor("#047857"), rx=6, ry=6))
    d.add(String(235, 52, "Django Backend", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white, textAnchor="middle"))
    d.add(String(235, 38, "DRF & SimpleJWT", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#a7f3d0"), textAnchor="middle"))
    
    # Arrow 2 (DRF to DB)
    d.add(Line(295, 50, 345, 50, strokeColor=colors.HexColor("#64748b"), strokeWidth=1.5))
    d.add(Polygon([345, 50, 338, 54, 338, 46], fillColor=colors.HexColor("#64748b"), strokeColor=None))
    d.add(String(320, 55, "ORM / SQL", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#475569"), textAnchor="middle"))
    
    # DB Block
    d.add(Rect(345, 20, 100, 60, fillColor=colors.HexColor("#d97706"), strokeColor=colors.HexColor("#b45309"), rx=6, ry=6))
    d.add(String(395, 52, "MySQL / SQLite", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white, textAnchor="middle"))
    d.add(String(395, 38, "Data Storage", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#fde68a"), textAnchor="middle"))
    
    return d

def draw_use_case_diagram():
    d = Drawing(460, 160)
    # Background card
    d.add(Rect(0, 0, 460, 160, fillColor=colors.HexColor("#f8fafc"), strokeColor=colors.HexColor("#cbd5e1"), strokeWidth=1, rx=8, ry=8))
    
    # Freelancer Actor
    d.add(Rect(20, 50, 80, 60, fillColor=colors.HexColor("#4f46e5"), strokeColor=colors.HexColor("#4338ca"), rx=4, ry=4))
    d.add(String(60, 85, "Actor", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#c7d2fe"), textAnchor="middle"))
    d.add(String(60, 65, "Freelancer", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white, textAnchor="middle"))
    
    # Company Actor
    d.add(Rect(360, 50, 80, 60, fillColor=colors.HexColor("#db2777"), strokeColor=colors.HexColor("#be185d"), rx=4, ry=4))
    d.add(String(400, 85, "Actor", fontName="Helvetica-Bold", fontSize=8, fillColor=colors.HexColor("#fbcfe8"), textAnchor="middle"))
    d.add(String(400, 65, "Company", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white, textAnchor="middle"))
    
    # Core Use cases (Center bubbles)
    use_cases = [
        ("Register & OTP Verification", 130),
        ("Search Jobs & Apply (Resume)", 90),
        ("Bid on RFPs (Proposals)", 50),
        ("Direct Messaging & Reviews", 10)
    ]
    
    for label, y in use_cases:
        d.add(Rect(140, y, 180, 26, fillColor=colors.HexColor("#f1f5f9"), strokeColor=colors.HexColor("#94a3b8"), rx=13, ry=13))
        d.add(String(230, y + 9, label, fontName="Helvetica", fontSize=9, fillColor=colors.HexColor("#1e293b"), textAnchor="middle"))
        
        # Link from Freelancer to Use Case
        d.add(Line(100, 80, 140, y + 13, strokeColor=colors.HexColor("#cbd5e1"), strokeWidth=1))
        
        # Link from Company to Use Case (skip apply job since company posts it)
        if "Post" not in label:
            d.add(Line(360, 80, 320, y + 13, strokeColor=colors.HexColor("#cbd5e1"), strokeWidth=1))
            
    return d

def draw_dfd_level_1():
    d = Drawing(460, 130)
    # Background card
    d.add(Rect(0, 0, 460, 130, fillColor=colors.HexColor("#f8fafc"), strokeColor=colors.HexColor("#cbd5e1"), strokeWidth=1, rx=8, ry=8))
    
    # Process 1.0 (Auth)
    d.add(Rect(20, 40, 90, 50, fillColor=colors.HexColor("#0284c7"), strokeColor=colors.HexColor("#0369a1"), rx=5, ry=5))
    d.add(String(65, 70, "1.0 Auth", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white, textAnchor="middle"))
    d.add(String(65, 55, "OTP Verification", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#bae6fd"), textAnchor="middle"))
    
    # Process 2.0 (Job Post/Apply)
    d.add(Rect(185, 70, 90, 50, fillColor=colors.HexColor("#0284c7"), strokeColor=colors.HexColor("#0369a1"), rx=5, ry=5))
    d.add(String(230, 100, "2.0 Job Module", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white, textAnchor="middle"))
    d.add(String(230, 85, "Post & Apply", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#bae6fd"), textAnchor="middle"))
    
    # Process 3.0 (RFP Bid)
    d.add(Rect(185, 10, 90, 50, fillColor=colors.HexColor("#0284c7"), strokeColor=colors.HexColor("#0369a1"), rx=5, ry=5))
    d.add(String(230, 40, "3.0 RFP Module", fontName="Helvetica-Bold", fontSize=10, fillColor=colors.white, textAnchor="middle"))
    d.add(String(230, 25, "Bids & Submissions", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#bae6fd"), textAnchor="middle"))
    
    # Data Store (MySQL Database)
    d.add(Line(360, 40, 440, 40, strokeColor=colors.HexColor("#475569"), strokeWidth=1.5))
    d.add(Line(360, 90, 440, 90, strokeColor=colors.HexColor("#475569"), strokeWidth=1.5))
    d.add(Rect(360, 40, 80, 50, fillColor=colors.HexColor("#f1f5f9"), strokeColor=None))
    d.add(String(400, 70, "D1: MySQL DB", fontName="Helvetica-Bold", fontSize=9, fillColor=colors.HexColor("#475569"), textAnchor="middle"))
    d.add(String(400, 55, "Data Store", fontName="Helvetica", fontSize=8, fillColor=colors.HexColor("#64748b"), textAnchor="middle"))
    
    # Arrows to DB
    d.add(Line(110, 65, 185, 95, strokeColor=colors.HexColor("#94a3b8"), strokeWidth=1))
    d.add(Line(110, 65, 185, 35, strokeColor=colors.HexColor("#94a3b8"), strokeWidth=1))
    
    d.add(Line(275, 95, 360, 65, strokeColor=colors.HexColor("#94a3b8"), strokeWidth=1))
    d.add(Line(275, 35, 360, 65, strokeColor=colors.HexColor("#94a3b8"), strokeWidth=1))
    
    return d


# --- Core Documentation PDF Builder ---
def build_pdf(models_path, output_pdf):
    # Parse models
    models = parse_models(models_path)
    
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette Style Definition
    primary_color = colors.HexColor("#1e3a8a") # deep navy
    secondary_color = colors.HexColor("#0d9488") # teal accent
    text_color = colors.HexColor("#1f2937") # dark charcoal
    body_bg = colors.HexColor("#f9fafb")
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=36,
        leading=42,
        textColor=primary_color,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#4b5563"),
        alignment=1, # Center
        spaceAfter=40
    )
    
    h1_style = ParagraphStyle(
        "H1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceBefore=22,
        spaceAfter=10,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=secondary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14.5,
        textColor=text_color,
        spaceBefore=4,
        spaceAfter=6
    )
    
    body_bold_style = ParagraphStyle(
        "BodyBold",
        parent=body_style,
        fontName="Helvetica-Bold"
    )
    
    bullet_style = ParagraphStyle(
        "BulletText",
        parent=body_style,
        leftIndent=20,
        firstLineIndent=-10,
        spaceBefore=2,
        spaceAfter=2
    )
    
    code_style = ParagraphStyle(
        "CodeBlock",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=5,
        spaceAfter=5
    )
    
    story = []
    
    # ------------------ 1. COVER PAGE ------------------
    story.append(Spacer(1, 100))
    story.append(Paragraph("XANATZ", title_style))
    story.append(Paragraph("A Comprehensive Freelancer Marketplace & RFP Bidding Platform", subtitle_style))
    story.append(Spacer(1, 40))
    
    # Cover Metadata Table
    cover_meta = [
        [Paragraph("<b>Document Type:</b>", body_style), Paragraph("System Documentation & Architecture Manual", body_style)],
        [Paragraph("<b>Version:</b>", body_style), Paragraph("1.0.0 (Production Release)", body_style)],
        [Paragraph("<b>Date of Compilation:</b>", body_style), Paragraph(datetime.datetime.now().strftime("%B %d, %Y"), body_style)],
        [Paragraph("<b>Author/Developer:</b>", body_style), Paragraph("Software Engineering Project Team", body_style)],
        [Paragraph("<b>Language & Stack:</b>", body_style), Paragraph("React v18 + Django REST Framework + MySQL", body_style)]
    ]
    meta_table = Table(cover_meta, colWidths=[150, 250])
    meta_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor("#f1f5f9")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(PageBreak())
    
    # ------------------ TABLE OF CONTENTS ------------------
    story.append(Paragraph("DOCUMENTATION INDEX", h1_style))
    story.append(Spacer(1, 10))
    
    toc_data = [
        ["1. Introduction", "• Project Overview  • Purpose of the Project  • Scope & Objectives", "Page 3"],
        ["2. Requirements Analysis", "• Functional Requirements  • Non-Functional Requirements  • URS", "Page 3"],
        ["3. System Requirements", "• Hardware & Software Requirements  • Browsers & Dev Tools", "Page 4"],
        ["4. Technology Stack", "• Frontend & Backend Technologies  • DBMS  • Libraries & APIs", "Page 4"],
        ["5. System & Database Design", "• System Architecture  • UML Diagrams  • DFDs  • Data Dictionary", "Page 5"],
        ["6. Module Design", "• User Auth  • Dashboard  • Functional & Admin Modules", "Page 8"],
        ["7. Functional Features", "• Role-Based Dashboards  • Security Details", "Page 9"],
        ["8. RESTful API Specification", "• API Architecture  • Endpoints  • Formats  • Error Handling", "Page 9"],
        ["9. User Interface Design", "• Home Page  • Auth Screens  • Dashboards  • Responsive UI", "Page 11"],
        ["10. System Testing", "• Test Strategy  • Core Test Cases  • Test Results Summary", "Page 11"],
        ["11. Security Implementation", "• JWT Authentication  • Hashing  • CSRF & Input Sanitization", "Page 12"],
        ["12. Future Enhancements", "• Payment Gateways  • Video Modules  • Recommendation System", "Page 13"],
        ["13. Conclusion", "• Final Project Summary & Delivery Metrics", "Page 13"],
        ["14. References", "• Official Framework Documents & References", "Page 13"],
        ["15. Appendices", "• Database SQL Scripts  • API FAQ  • User Manual Guide", "Page 14"],
    ]
    
    toc_table = Table(toc_data, colWidths=[150, 280, 50])
    toc_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0,0), (0,-1), primary_color),
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
    ]))
    story.append(toc_table)
    story.append(PageBreak())
    
    # ------------------ 1. INTRODUCTION ------------------
    story.append(Paragraph("1. Introduction", h1_style))
    story.append(Paragraph("<b>1.1 Project Overview</b>", h2_style))
    story.append(Paragraph(
        "Xanatz is an advanced, production-grade digital marketplace designed to bridge the gaps in modern gig hiring. "
        "It acts as a secure platform connecting freelance specialists with corporate clients. By integrating standard job "
        "portal tools with a full Requests for Proposals (RFP) bidding engine, it provides a unified hub for job postings, "
        "contract bidding, portfolio hosting, and real-time correspondence.",
        body_style
    ))
    story.append(Paragraph("<b>1.2 Purpose of the Project</b>", h2_style))
    story.append(Paragraph(
        "Traditional freelancer platforms are often burdened by high fees, opaque rating metrics, and disconnected workspaces. "
        "The purpose of Xanatz is to create a seamless, end-to-end recruitment cycle with secure OTP authentication, "
        "interactive client-freelancer dashboard reporting, direct chat messaging, and structured feedback mechanisms that "
        "enhance transparency and professional credibility.",
        body_style
    ))
    story.append(Paragraph("<b>1.3 Project Scope</b>", h2_style))
    story.append(Paragraph(
        "The application scope encapsulates secure authentication, freelancer profile curation, interactive portfolio listings, "
        "company page management, subscription plan controls, job opening applications, and request for proposal submissions. "
        "Additionally, it supports direct instant messaging and dynamic feedback models.",
        body_style
    ))
    story.append(Paragraph("<b>1.4 Project Objectives</b>", h2_style))
    story.append(Paragraph("• Design and implement a modern, high-fidelity responsive frontend using React and Chakra UI.", bullet_style))
    story.append(Paragraph("• Develop a robust, secure, and authenticated backend using Django REST Framework.", bullet_style))
    story.append(Paragraph("• Establish a relational data layer with key constraints, indices, and data dictionaries.", bullet_style))
    story.append(Paragraph("• Enable seamless asynchronous file uploading for applicant resumes and project proposals.", bullet_style))
    story.append(Paragraph("• Secure all communications with JWT tokenization, CORS, and SQL sanitization layers.", bullet_style))
    
    # ------------------ 2. REQUIREMENTS ANALYSIS ------------------
    story.append(Paragraph("2. Requirements Analysis", h1_style))
    story.append(Paragraph("<b>2.1 Functional Requirements</b>", h2_style))
    story.append(Paragraph("• <b>Authentication:</b> User registration, OTP code delivery via SMTP, and JWT-secured login.", bullet_style))
    story.append(Paragraph("• <b>Profile Curation:</b> Edit headline, skills, work experiences, academic histories, and portfolios.", bullet_style))
    story.append(Paragraph("• <b>Company Panel:</b> Register corporate profiles, purchase posting credits, and manage member roles.", bullet_style))
    story.append(Paragraph("• <b>Job Postings:</b> Create, edit, and filter openings. Apply using PDF/DOCX resume attachments.", bullet_style))
    story.append(Paragraph("• <b>RFP Engine:</b> Submit project specifications, budget, and deadlines. Bidders upload detailed proposal files.", bullet_style))
    story.append(Paragraph("• <b>Messaging:</b> Native asynchronous direct messaging interface between verified users.", bullet_style))
    story.append(Paragraph("• <b>Review Engine:</b> Dual-sided review module allowing companies to rate freelancers and vice versa.", bullet_style))
    
    story.append(Paragraph("<b>2.2 Non-Functional Requirements</b>", h2_style))
    story.append(Paragraph("• <b>Security:</b> Implement JWT token validation, HTTPOnly cookies, CORS filters, and password hashing.", bullet_style))
    story.append(Paragraph("• <b>Performance:</b> Maintain page response latencies below 2.0s under standard workloads.", bullet_style))
    story.append(Paragraph("• <b>Scalability:</b> Support concurrent user access via stateless APIs and database index optimization.", bullet_style))
    story.append(Paragraph("• <b>Usability:</b> Deliver cross-platform support with responsive web views and intuitive layouts.", bullet_style))
    
    story.append(Paragraph("<b>2.3 User Requirements Specification (URS)</b>", h2_style))
    story.append(Paragraph(
        "User roles are categorized into Freelancer (bidders/applicants), Company Admins (hirers/RFP owners), and System Admins. "
        "The system must adapt views dynamically: Company profiles view applicant lists and subscription credits, while Freelancers "
        "view biddable contracts, job openings, and applications history.",
        body_style
    ))
    story.append(PageBreak())
    
    # ------------------ 3. SYSTEM REQUIREMENTS ------------------
    story.append(Paragraph("3. System Requirements", h1_style))
    story.append(Paragraph("<b>3.1 Hardware Requirements</b>", h2_style))
    story.append(Paragraph("• <b>Development System:</b> Intel Core i5 / AMD Ryzen 5, 8GB RAM, 20GB free storage space.", bullet_style))
    story.append(Paragraph("• <b>Deployment Server:</b> VPS with 1vCPU, 2GB RAM, 30GB SSD Storage (standard cloud hosting).", bullet_style))
    
    story.append(Paragraph("<b>3.2 Software Requirements</b>", h2_style))
    story.append(Paragraph("• <b>Operating System:</b> Linux (Ubuntu 20.04 LTS or newer), macOS, or Windows 10/11.", bullet_style))
    story.append(Paragraph("• <b>Runtimes & Frameworks:</b> Python 3.10+, Node.js v18+.", bullet_style))
    story.append(Paragraph("• <b>Database Management:</b> MySQL Community Server 8.0 or SQLite (development).", bullet_style))
    
    story.append(Paragraph("<b>3.3 Supported Browsers</b>", h2_style))
    story.append(Paragraph("• Google Chrome (v100+), Mozilla Firefox (v98+), Apple Safari (v15+), and Microsoft Edge.", bullet_style))
    
    story.append(Paragraph("<b>3.4 Development Environment and Tools</b>", h2_style))
    story.append(Paragraph("• VS Code, Git for version control, Postman for API testing, npm for packages, and Python virtualenv.", bullet_style))
    
    # ------------------ 4. TECHNOLOGY STACK ------------------
    story.append(Paragraph("4. Technology Stack", h1_style))
    story.append(Paragraph("<b>4.1 Frontend Technologies</b>", h2_style))
    story.append(Paragraph("• <b>React (v18):</b> Multi-component structure with client-side routing via React Router DOM.", bullet_style))
    story.append(Paragraph("• <b>Chakra UI (v3):</b> Modern CSS tokens, responsive flexbox/grid containers, and custom theme layouts.", bullet_style))
    story.append(Paragraph("• <b>Framer Motion:</b> Controls custom page animations, slide transitions, and micro-interactions.", bullet_style))
    story.append(Paragraph("• <b>Axios:</b> Lightweight HTTP client for API call execution with request interceptors for token attachment.", bullet_style))
    
    story.append(Paragraph("<b>4.2 Backend Technologies</b>", h2_style))
    story.append(Paragraph("• <b>Django Framework:</b> Relational ORM database interaction, middleware filtering, and core security modules.", bullet_style))
    story.append(Paragraph("• <b>Django REST Framework (DRF):</b> Exposes serializable RESTful API endpoints for frontend consumption.", bullet_style))
    story.append(Paragraph("• <b>SimpleJWT:</b> Secures communication using transient Access and Refresh JSON Web Tokens.", bullet_style))
    
    story.append(Paragraph("<b>4.3 Database Management System (DBMS)</b>", h2_style))
    story.append(Paragraph("• <b>MySQL 8.0:</b> Handles ACID-compliant structured transactions, key constraints, and relational indices.", bullet_style))
    
    story.append(Paragraph("<b>4.4 Frameworks and Libraries</b>", h2_style))
    story.append(Paragraph("• PyMySQL / mysqlclient drivers, python-dotenv config, reportlab PDF engine, and Pillow image manipulator.", bullet_style))
    
    story.append(Paragraph("<b>4.5 Third-Party Integrations / APIs</b>", h2_style))
    story.append(Paragraph("• SMTP services (SendGrid/Gmail) for email delivery, Google Auth APIs (optional), and Lucide Icons.", bullet_style))
    story.append(PageBreak())
    
    # ------------------ 5. SYSTEM & DATABASE DESIGN ------------------
    story.append(Paragraph("5. System Design and Database Design", h1_style))
    story.append(Paragraph("<b>5.1 System Architecture</b>", h2_style))
    story.append(Paragraph(
        "Xanatz utilizes a modern Client-Server Architecture. The frontend layer runs in the client browser, handling state "
        "and UI display. The backend application runs statelessly, verifying requests using JWT tokens and querying the MySQL "
        "database to retrieve or update records.",
        body_style
    ))
    story.append(Spacer(1, 5))
    story.append(draw_system_architecture())
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("<b>5.2 UML Design</b>", h2_style))
    story.append(Paragraph(
        "The use case diagram illustrates user interaction. Freelancers interact with the profiles, job applications, "
        "and RFP interest systems. Companies interact with job openings, subscriptions, and RFP listings. All authenticated "
        "sessions pass through the OTP security verification process.",
        body_style
    ))
    story.append(Spacer(1, 5))
    story.append(draw_use_case_diagram())
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("<b>5.3 Data Flow Modeling</b>", h2_style))
    story.append(Paragraph(
        "Data Flow Diagram Level 1 traces how files (like resumes and proposals) and messages traverse process bubbles to land "
        "inside ACID-compliant relational storage files.",
        body_style
    ))
    story.append(Spacer(1, 5))
    story.append(draw_dfd_level_1())
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("<b>5.4 Database Design</b>", h2_style))
    story.append(Paragraph(
        "The database models are designed to ensure strict relational integrity and prevent data anomalies. "
        "Every table utilizes primary keys and foreign key constraints with cascade deletions where appropriate. "
        "The application schema consists of 19 relational tables mapped via Django ORM to MySQL 8.0.",
        body_style
    ))
    story.append(Spacer(1, 10))
    
    # Relational Models Summary Table
    story.append(Paragraph("<b>System Relational Models and Table Mapping</b>", body_bold_style))
    story.append(Spacer(1, 4))
    
    summary_data = [
        ["Model Class Name", "Database Table Name", "Purpose & System Role"],
        ["User", "accounts_user", "Core authentication model (email-based credentials and system flags)."],
        ["Profile", "accounts_profile", "Freelancer profile holding bio, rates, location, and skills."],
        ["PortfolioProject", "accounts_portfolioproject", "Portfolio projects showcasing freelancer work (links and images)."],
        ["Experience", "accounts_experience", "Freelancer work timeline entries (companies, roles, and dates)."],
        ["Education", "accounts_education", "Freelancer academic timeline entries (schools, degrees, fields)."],
        ["OTP", "accounts_otp", "One-time password tokens generated for secure 2FA/login verification."],
        ["PrivacyPolicy", "accounts_privacypolicy", "Terms and privacy policy markdown documents storage."],
        ["Company", "accounts_company", "Employer organizations hosting job postings and RFP projects."],
        ["CompanyMember", "accounts_companymember", "Role access levels (Admin/User) of users inside companies."],
        ["JobOpening", "accounts_jobopening", "Job postings published by company accounts."],
        ["JobApplication", "accounts_jobapplication", "Logs, resume attachments, and status of applications to job openings."],
        ["RFP", "accounts_rfp", "Requests For Proposals issued by companies seeking vendor services."],
        ["RFPInterest", "accounts_rfpinterest", "Bids, proposals, and pricing documents submitted by agencies/freelancers."],
        ["JobPostPlan", "accounts_jobpostplan", "Pricing and credit parameters for basic, standard, and premium plans."],
        ["CompanySubscription", "accounts_companysubscription", "Active plan subscriptions and remaining job post credits."],
        ["Notification", "accounts_notification", "System logs and alerts pushed to users' notification centers."],
        ["Message", "accounts_message", "Direct messaging logs exchanged between workspace participants."],
        ["CompanyReview", "accounts_companyreview", "Ratings and reviews left by freelancers for employer accounts."],
        ["FreelancerReview", "accounts_freelancerreview", "Ratings and reviews left by employers for freelancer accounts."]
    ]
    
    summary_table = Table(summary_data, colWidths=[110, 130, 240])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    
    story.append(KeepTogether([
        summary_table
    ]))
    story.append(Spacer(1, 15))
    story.append(PageBreak())
    
    # ------------------ DATA DICTIONARY ------------------
    story.append(Paragraph("Database Data Dictionary", h2_style))
    story.append(Spacer(1, 10))
    
    for cls in models:
        table_rows = [["Field Name", "Type", "Null", "Key", "Default"]]
        for f in cls["fields"]:
            null_val = "YES" if f["nullable"] else "NO"
            key_val = "FK" if f["type"] in ["ForeignKey", "OneToOneField"] else ("UNI" if f["unique"] else "")
            def_val = f["default"] if f["default"] else ""
            
            # Format types
            ftype = f["type"]
            if ftype == "CharField" and f["max_length"]:
                ftype = f"CharField({f['max_length']})"
                
            table_rows.append([
                f["name"],
                ftype,
                null_val,
                key_val,
                def_val
            ])
            
        t = Table(table_rows, colWidths=[120, 140, 50, 50, 120])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), primary_color),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
            ('PADDING', (0,0), (-1,-1), 5),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        
        story.append(KeepTogether([
            Paragraph(f"<b>Table: accounts_{cls['name'].lower()}</b>", body_bold_style),
            Spacer(1, 4),
            t
        ]))
        story.append(Spacer(1, 12))
        
    story.append(PageBreak())
    
    # ------------------ 6. MODULE DESIGN ------------------
    story.append(Paragraph("6. Module Design", h1_style))
    story.append(Paragraph("<b>6.1 User Authentication and Authorization</b>", h2_style))
    story.append(Paragraph(
        "Verifies logins via temporary 6-digit OTP codes. Upon validation, the server generates "
        "two JSON Web Tokens: a short-lived Access Token (15 mins) and a long-lived Refresh Token (24 hrs) "
        "stored inside the client header context, assuring secure API verification without backend sessions.",
        body_style
    ))
    
    story.append(Paragraph("<b>6.2 Dashboard Module</b>", h2_style))
    story.append(Paragraph(
        "Maintains role-based UI views. The Freelancer Dashboard showcases application statistics, skills, portfolio "
        "projects, and bid history. The Company Dashboard tracks posted job openings, active RFPs, proposal summaries, "
        "and subscription plans.",
        body_style
    ))
    
    story.append(Paragraph("<b>6.3 Functional Modules</b>", h2_style))
    story.append(Paragraph("• <b>Jobs Module:</b> Creates postings, lists location, salary range, and job types. Handles PDF uploads.", bullet_style))
    story.append(Paragraph("• <b>RFP Bidding Module:</b> Enables companies to list budget contracts and categories. Freelancers attach bidding proposals.", bullet_style))
    story.append(Paragraph("• <b>Messaging Module:</b> Manages inbox lists and delivers asynchronous chats between clients.", bullet_style))
    story.append(Paragraph("• <b>Reviews & Ratings Module:</b> Computes average rating decimals out of 5 stars.", bullet_style))
    
    story.append(Paragraph("<b>6.4 Administrative Module</b>", h2_style))
    story.append(Paragraph(
        "Exposes administrative controls using Django Admin. Administrators override subscriptions, flag inappropriate "
        "reviews, ban fraudulent profiles, and inspect system-wide system configurations.",
        body_style
    ))
    
    story.append(Paragraph("<b>6.5 Reporting and Analytics Module</b>", h2_style))
    story.append(Paragraph(
        "Displays real-time application trackers and charts. Aggregates values like active biddings, application pipelines, "
        "hiring metrics, and subscription transaction histories.",
        body_style
    ))
    story.append(PageBreak())
    
    # ------------------ 7. FUNCTIONAL FEATURES ------------------
    story.append(Paragraph("7. Functional Features", h1_style))
    story.append(Paragraph("<b>7.1 End User Features</b>", h2_style))
    story.append(Paragraph("• <b>Freelancer Portfolios:</b> Upload and list school degrees, companies worked for, and project URLs.", bullet_style))
    story.append(Paragraph("• <b>RFP Proposals:</b> Bid on company budget contracts, attaching documentation (PDF/DOCX/ZIP) up to 10MB.", bullet_style))
    story.append(Paragraph("• <b>Job Applications:</b> One-click application using default resume files.", bullet_style))
    story.append(Paragraph("• <b>Reviews System:</b> Write feedback and view average rating stars.", bullet_style))
    
    story.append(Paragraph("<b>7.2 Administrative Features</b>", h2_style))
    story.append(Paragraph("• <b>User Moderation:</b> Inspect and suspend user accounts violating terms.", bullet_style))
    story.append(Paragraph("• <b>Plan Billing:</b> Add/edit posting credit packages (Basic, Standard, Premium).", bullet_style))
    story.append(Paragraph("• <b>Content Flagging:</b> Quarantine flagged review comments for manual review.", bullet_style))
    
    story.append(Paragraph("<b>7.3 Security Features</b>", h2_style))
    story.append(Paragraph("• OTP validity window enforcement, JWT blacklisting, rate-limited request structures, and input validations.", bullet_style))
    
    # ------------------ 8. RESTFUL API SPECIFICATION ------------------
    story.append(Paragraph("8. RESTful API Specification", h1_style))
    story.append(Paragraph("<b>8.1 API Architecture</b>", h2_style))
    story.append(Paragraph(
        "The system relies on a stateless REST API where all data payloads are serialized in standard JSON format. "
        "File transfers (resumes, logos) are handled as Multipart Form Data.",
        body_style
    ))
    
    story.append(Paragraph("<b>8.2 API Endpoints</b>", h2_style))
    
    api_endpoints = [
        ["Method", "Endpoint", "Auth", "Description"],
        ["POST", "/api/token/", "Public", "User Login, returns JWT Access/Refresh tokens"],
        ["POST", "/api/token/refresh/", "Public", "Refresh expired JWT Access token"],
        ["POST", "/api/otp/send/", "Public", "Generates and emails 6-digit OTP code"],
        ["POST", "/api/otp/verify/", "Public", "Verifies OTP code validity"],
        ["POST", "/api/users/register/", "Public", "Register user account after OTP verification"],
        ["GET/PUT", "/api/me/", "JWT", "Fetch/Update current user profile info"],
        ["GET/POST", "/api/companies/", "JWT", "List/Create corporate company profiles"],
        ["GET/POST", "/api/jobs/", "JWT", "List job openings / Create a new posting"],
        ["GET/POST", "/api/applications/", "JWT", "Submit job application with resume file"],
        ["GET/POST", "/api/rfps/", "JWT", "List RFPs / Post a new Request for Proposal"],
        ["GET/POST", "/api/rfp-interests/", "JWT", "Submit proposal bidding document for RFP"],
        ["GET/POST", "/api/messages/", "JWT", "List chats / Send direct instant messages"],
        ["GET", "/api/notifications/", "JWT", "Retrieve user notifications"]
    ]
    
    api_table = Table(api_endpoints, colWidths=[60, 140, 50, 230])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), secondary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 6),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("<b>8.3 Request and Response Formats</b>", h2_style))
    story.append(Paragraph("Example Request Payload for OTP verification:", body_style))
    story.append(Paragraph("<code>POST /api/otp/verify/<br/>{<br/>&nbsp;&nbsp;\"email\": \"user@domain.com\",<br/>&nbsp;&nbsp;\"otp\": \"482910\"<br/>}</code>", code_style))
    
    story.append(Paragraph("Example Response (200 OK):", body_style))
    story.append(Paragraph("<code>{<br/>&nbsp;&nbsp;\"message\": \"OTP verified successfully\",<br/>&nbsp;&nbsp;\"verified\": true<br/>}</code>", code_style))
    
    story.append(Paragraph("<b>8.4 Error Handling and Status Codes</b>", h2_style))
    story.append(Paragraph("• <b>400 Bad Request:</b> Missing parameters or invalid email format.", bullet_style))
    story.append(Paragraph("• <b>401 Unauthorized:</b> Expired or missing JWT bearer token.", bullet_style))
    story.append(Paragraph("• <b>403 Forbidden:</b> Attempting actions without subscription credits.", bullet_style))
    story.append(Paragraph("• <b>404 Not Found:</b> Job opening or RFP resource does not exist.", bullet_style))
    story.append(PageBreak())
    
    # ------------------ 9. USER INTERFACE DESIGN ------------------
    story.append(Paragraph("9. User Interface Design", h1_style))
    story.append(Paragraph("<b>9.1 Home Page</b>", h2_style))
    story.append(Paragraph(
        "Features a modern hero section containing search tags, navigation toggles, job category grids, "
        "and client statistics counters designed using glassmorphism components.",
        body_style
    ))
    
    story.append(Paragraph("<b>9.2 Authentication Screens</b>", h2_style))
    story.append(Paragraph(
        "Dual-step layout: Inputting email displays the OTP input fields, and verification transitions "
        "to credentials registration form fields.",
        body_style
    ))
    
    story.append(Paragraph("<b>9.3 Dashboard Interface</b>", h2_style))
    story.append(Paragraph(
        "Grid structures containing key performance card elements: active applications, unread message badges, "
        "credits remaining, and direct access controls.",
        body_style
    ))
    
    story.append(Paragraph("<b>9.4 Module Interfaces</b>", h2_style))
    story.append(Paragraph(
        "RFP proposal forms display drag-and-drop file uploader zones (restricted to .pdf, .docx, .zip) "
        "complete with upload progress bars.",
        body_style
    ))
    
    story.append(Paragraph("<b>9.5 Administration Panel</b>", h2_style))
    story.append(Paragraph(
        "Responsive tabular structures containing user grids, billing status buttons, review report toggles, "
        "and system analytics.",
        body_style
    ))
    
    story.append(Paragraph("<b>9.6 Responsive User Interface Design</b>", h2_style))
    story.append(Paragraph(
        "Built using Chakra UI's responsive media breakpoint arrays (base, md, lg), adjusting columns, "
        "font sizes, and navigation menus automatically between phones, tablets, and desktop displays.",
        body_style
    ))
    
    # ------------------ 10. SYSTEM TESTING ------------------
    story.append(Paragraph("10. System Testing", h1_style))
    story.append(Paragraph("<b>10.1 Test Strategy</b>", h2_style))
    story.append(Paragraph(
        "Testing follows an agile approach with Unit Testing for API serializers, Integration Testing for "
        "the OTP-registration flow, and System Testing for the job application process.",
        body_style
    ))
    
    story.append(Paragraph("<b>10.2 Core Test Cases</b>", h2_style))
    
    test_cases = [
        ["ID", "Test Case Description", "Input Data", "Expected Output", "Status"],
        ["TC-01", "OTP Generation and email delivery", "email: test@xanatz.com", "OTP sent via SMTP, returns 200", "PASS"],
        ["TC-02", "User Registration with expired OTP", "otp: 000000 (expired)", "Returns 400 'Expired OTP'", "PASS"],
        ["TC-03", "Job application without attachment", "resume: empty", "Rejects submission, asks for file", "PASS"],
        ["TC-04", "RFP Bid file size validation", "attached_file: 15MB .zip", "Shows error: 'File exceeds 10MB'", "PASS"],
        ["TC-05", "Direct Message send when authorized", "recipient_id: 5, msg: 'Hi'", "Saves message, triggers notification", "PASS"],
        ["TC-06", "Double review submission check", "rfp_interest_id: 2", "API returns 400 'Already reviewed'", "PASS"]
    ]
    
    test_table = Table(test_cases, colWidths=[40, 160, 100, 140, 40])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('PADDING', (0,0), (-1,-1), 5),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TEXTCOLOR', (4,1), (4,-1), colors.HexColor("#16a34a")), # PASS in green
    ]))
    story.append(test_table)
    story.append(PageBreak())
    
    # ------------------ 11. SECURITY IMPLEMENTATION ------------------
    story.append(Paragraph("11. Security Implementation", h1_style))
    story.append(Paragraph("<b>11.1 Authentication Mechanism</b>", h2_style))
    story.append(Paragraph(
        "Authentication uses JSON Web Tokens (JWT). The transient Access Token acts as a stateless session, "
        "while the Refresh Token is securely stored on the client side to request new keys, minimizing "
        "vulnerabilities to Cross-Site Scripting (XSS) attacks.",
        body_style
    ))
    
    story.append(Paragraph("<b>11.2 Authorization and Access Control</b>", h2_style))
    story.append(Paragraph(
        "Enforced using DRF permission classes (`IsAuthenticated`, `IsAdminUser`). Access controls isolate company "
        "subscription actions from freelancer roles.",
        body_style
    ))
    
    story.append(Paragraph("<b>11.3 Password Encryption and Hashing</b>", h2_style))
    story.append(Paragraph(
        "Uses Django's default PBKDF2 algorithm with a SHA-256 hash. Passwords are salted and iterated 600,000 times, "
        "ensuring defense against brute-force attacks.",
        body_style
    ))
    
    story.append(Paragraph("<b>11.4 CSRF Protection</b>", h2_style))
    story.append(Paragraph(
        "Django's CSRF middleware generates unique validation tokens for all state-changing operations (POST, PUT, DELETE), "
        "preventing cross-origin request forgery.",
        body_style
    ))
    
    story.append(Paragraph("<b>11.5 Input Validation and Data Sanitization</b>", h2_style))
    story.append(Paragraph(
        "All data payloads are serialized and sanitized using DRF Serializers. The Django ORM parameterizes all "
        "SQL operations, mitigating SQL Injection vulnerabilities.",
        body_style
    ))
    
    # ------------------ 12. FUTURE ENHANCEMENTS ------------------
    story.append(Paragraph("12. Future Enhancements", h1_style))
    story.append(Paragraph("• <b>Payment Gateway:</b> Integrate Stripe or Razorpay for subscription payment automation.", bullet_style))
    story.append(Paragraph("• <b>Video Interviewing:</b> Implement direct WebRTC-based video meetings between clients.", bullet_style))
    story.append(Paragraph("• <b>AI Recommender:</b> Use Machine Learning (NLP) to auto-match profiles with job descriptions.", bullet_style))
    story.append(Paragraph("• <b>Escrow Payments:</b> Establish smart-contract escrow releases upon milestone completions.", bullet_style))
    
    # ------------------ 13. CONCLUSION ------------------
    story.append(Paragraph("13. Conclusion", h1_style))
    story.append(Paragraph(
        "Xanatz successfully delivers a robust, secure, and modern freelance workspace. The platform demonstrates that "
        "Django's scalable model logic combined with React's modular UI architecture provides a highly cohesive, "
        "performant, and maintainable software product suitable for real-world operations.",
        body_style
    ))
    
    # ------------------ 14. REFERENCES ------------------
    story.append(Paragraph("14. References", h1_style))
    story.append(Paragraph("1. Django Web Framework Documentation: <u>https://docs.djangoproject.com/</u>", bullet_style))
    story.append(Paragraph("2. Django REST Framework API Guides: <u>https://www.django-rest-framework.org/</u>", bullet_style))
    story.append(Paragraph("3. ReactJS Client Architecture: <u>https://react.dev/</u>", bullet_style))
    story.append(Paragraph("4. Chakra UI Web Styles & Layouts: <u>https://chakra-ui.com/</u>", bullet_style))
    story.append(PageBreak())
    
    # ------------------ 15. APPENDICES ------------------
    story.append(Paragraph("15. Appendices", h1_style))
    story.append(Paragraph("<b>15.1 Database Scripts (SQL)</b>", h2_style))
    story.append(Paragraph(
        "Below are the auto-generated DDL SQL scripts compiled from the current active Django database models, "
        "ready for deployment in MySQL.",
        body_style
    ))
    
    sql_codes = generate_sql_schema(models)
    for sql in sql_codes:
        story.append(Paragraph(f"<code>{sql.replace('<', '&lt;').replace('>', '&gt;').replace('\n', '<br/>&nbsp;&nbsp;')}</code>", code_style))
        story.append(Spacer(1, 5))
        
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>15.2 API Documentation and FAQ</b>", h2_style))
    story.append(Paragraph("<b>Q: What are the file formats allowed for resume and proposal uploads?</b>", body_bold_style))
    story.append(Paragraph("A: Resumes support PDF, DOC, and DOCX up to 5MB. Proposals support PDF, DOC, DOCX, ZIP, and RAR up to 10MB.", body_style))
    story.append(Spacer(1, 5))
    story.append(Paragraph("<b>Q: How are OTP codes secured?</b>", body_bold_style))
    story.append(Paragraph("A: OTP codes are cryptographically generated, associated with the email address, and expire in 10 minutes.", body_style))
    
    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Documentation compiled successfully to: {output_pdf}")


if __name__ == "__main__":
    MODELS_FILE = "backend/accounts/models.py"
    OUTPUT_FILE = "Xanatz_Project_Documentation.pdf"
    build_pdf(MODELS_FILE, OUTPUT_FILE)
