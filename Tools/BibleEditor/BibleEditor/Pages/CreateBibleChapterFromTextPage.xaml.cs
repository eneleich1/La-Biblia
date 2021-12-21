using BibleEditor.Tools;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Forms;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace BibleEditor.Pages
{
    /// <summary>
    /// Interaction logic for CreateBibleChapterFromTextPage.xaml
    /// </summary>
    public partial class CreateBibleChapterFromTextPage : System.Windows.Controls.UserControl
    {
        FolderBrowserDialog fb = new FolderBrowserDialog();
        OpenFileDialog ofd = new OpenFileDialog();

        public CreateBibleChapterFromTextPage()
        {
            InitializeComponent();
        }


        #region Event Handles

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            savePath_tb.Text = Configuration.MainConfiguration.ChaptersPath;
        }

        private void browse_bt_Click(object sender, RoutedEventArgs e)
        {
            if (ofd.ShowDialog() == DialogResult.OK)
            {
                LoadFile(ofd.FileName);
            }
        }

        private void choosePath_bt_Click(object sender, RoutedEventArgs e)
        {
            if (fb.ShowDialog() == DialogResult.OK)
            {
                savePath_tb.Text = fb.SelectedPath;
            }
        }

        private void createChapters_bt_Click(object sender, RoutedEventArgs e)
        {
            if (File.Exists(filePath_tb.Text))
            {
                try
                {
                    var result = CreateHtmlChapter(filePath_tb.Text);

                    if (result > 0)
                        System.Windows.MessageBox.Show($"{result} Chapters have been created successfully in the folder {Configuration.MainConfiguration.ChaptersPath}");
                    else
                        System.Windows.MessageBox.Show($"{result} Chapters have been created. There was an error or the file contain an incorrect format.");
                }
                catch (Exception ex)
                {
                    System.Windows.MessageBox.Show($"ERROR: {ex.Message}. StackTrace: {ex.StackTrace}");
                }
            }
        }

        private void filePath_tb_Drop(object sender, System.Windows.DragEventArgs e)
        {
            var source = new List<string>((string[])e.Data.GetData("FileDrop")).First();

            LoadFile(source);
        }

        #endregion


        #region Methods

        /// <summary>
        /// Load the file which contain the chapters to extract.
        /// </summary>
        /// <param name="filePath"></param>
        void LoadFile(string filePath)
        {
            if (File.Exists(filePath))
            {
                filePath_tb.Text = filePath;

                using (var r = new StreamReader(filePath))
                {
                    display_tb.Text = r.ReadToEnd();
                }
            }
        }

        /// <summary>
        /// Create the html page for each chapter in the specific sourceFile.
        /// </summary>
        /// <param name="sourceFile"></param>
        /// <returns></returns>
        private int CreateHtmlChapter(string sourceFile)
        {
            var chapters = GetChapters(sourceFile);

            foreach (var salmo in chapters)
            {
                //Page
                HtmlPage page = new HtmlPage();
                page.Html = HtmlNode.ParseHtml("<html>");

                //Head
                var head = page.Html.AddChild("<head>");
                var headReader = new StreamReader(new FileStream("head.txt", FileMode.Open, FileAccess.Read));
                head.Content = $"<title>Salmo {salmo.Number}</title>{Environment.NewLine}" + headReader.ReadToEnd();
                headReader.Close();

                //Body
                var body = page.Html.AddChild("<body>");

                //div class='header'
                var divHeader = body.AddChild("<div class = 'header'>");
                var divReader = new StreamReader(new FileStream("div content.txt", FileMode.Open, FileAccess.Read));
                var content = divReader.ReadToEnd();
                divHeader.Content = content;
                divReader.Close();

                var div_container = body.AddChild("<div class='container-fluid text-center section'>");
                AddSalmo(divHeader, div_container, salmo.Number, salmo.Number - 1, salmo.Versicles);

                //div class='header'
                body.AddChild(divHeader);

                var writer = new StreamWriter(new FileStream(System.IO.Path.Combine(Configuration.MainConfiguration.ChaptersPath, $"Salmo {salmo.Number}.html"), FileMode.Create, FileAccess.Write));
                page.Write(writer);
                writer.Close();
                writer.Dispose();
            }

            if (chapters == null) return 0;

            return chapters.Count;
        }

        MatchCollection Match(string patt, string text)
        {
            // Create a Regex  
            Regex rg = new Regex(patt, RegexOptions.Compiled | RegexOptions.IgnoreCase);

            // Get all matches  
            MatchCollection matches = rg.Matches(text);

            return matches;
        }

        List<Chapter> GetChapters(string filePath)
        {

            var chapters = new List<Chapter>();

            var reader = new StreamReader(new FileStream(filePath, FileMode.Open, FileAccess.Read));

            //salmo(s)?(?<spaces>\s+)(?<num>\d+)
            string namePatter = @"salmo(s)?(?<spaces>\s+)(?<num>\d+)";//@"Salmo\s+(?<num>\d+)";
            string versiclePatter = @"(?<index>\d+\s+)(?<vers>.+)";

            string text = "";
            Chapter chapter = new Chapter();
            while (!reader.EndOfStream)
            {
                text = reader.ReadLine();

                if (text != "")
                {
                    //Chapter Name
                    var matches = Match(namePatter, text);

                    if (matches.Count > 0)
                    {
                        if (chapter.Versicles.Count > 0)
                        {
                            chapters.Add(chapter);
                            chapter = new Chapter();
                        }

                        chapter.Name = "Salmo";
                        chapter.Number = int.Parse(matches[0].Groups["num"].Value);
                    }
                    else
                    {
                        matches = Match(versiclePatter, text);
                        if (matches.Count > 0)
                        {
                            chapter.Versicles.Add(matches[0].Groups["vers"].Value);
                        }
                    }
                }
            }

            if (chapter.Versicles.Count > 0)
                chapters.Add(chapter);

            reader.Close();
            reader.Dispose();

            return chapters;
        }

        private void AddSalmo(HtmlNode div_header, HtmlNode div_container, int salmNum, int salmAnt, List<string> versicles)
        {
            var back_bt = div_header.AddChild($"<button type=\"button\" class=\"btn btn-primary\" onclick=\"location.assign('Salmo {salmNum - 1}.html')\">");
            back_bt.AddChild("<span class='glyphicon glyphicon-chevron-left'>");

            var fwd_bt = div_header.AddChild($"<button type=\"button\" class=\"btn btn-primary\" onclick=\"location.assign('Salmo {salmNum + 1}.html')\">");
            fwd_bt.AddChild("<span class='glyphicon glyphicon-chevron-right'>");

            var div1 = div_container.AddChild("<div class='container-fluid text-center section'>");
            var div2 = div1.AddChild("<div class='row-content'>");
            var div3 = div2.AddChild("<div class='col-sm-3'>");
            var divTextCenter = div2.AddChild("<div class='col-sm-6 text-center'>");

            var row = divTextCenter.AddChild("<div class='row'>");

            var h1Chapter = row.AddChild($"<h1 id='chapter{salmNum}'>");
            h1Chapter.Content = $"Salmo {salmNum} ({salmNum - 1})";

            var div_book_page1 = row.AddChild("<div class='col-sm-6 book-page'>");

            HtmlNode a, p;

            for (int i = 0; i < versicles.Count / 2; i++)
            {
                p = div_book_page1.AddChild("<div>").AddChild("<p>");
                p.ContentFirsth = false;
                a = p.AddChild($"<a id='V{i + 1}'>");
                a.Content = $"{i + 1}";
                p.Content = versicles[i];
            }

            var div_book_page2 = row.AddChild("<div class='col-sm-6 book-page'>");
            for (int i = versicles.Count / 2; i < versicles.Count; i++)
            {
                p = div_book_page2.AddChild("<div>").AddChild("<p>");
                p.ContentFirsth = false;
                a = p.AddChild($"<a id='V{i + 1}'>");
                a.Content = $"{i + 1}";
                p.Content = versicles[i];
            }
        }

        #endregion

        
    }
}
