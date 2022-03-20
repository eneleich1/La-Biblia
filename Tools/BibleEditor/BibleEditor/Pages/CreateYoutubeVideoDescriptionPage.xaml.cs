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
    /// Interaction logic for CreateYoutubeVideoDescriptionPage.xaml
    /// </summary>
    public partial class CreateYoutubeVideoDescriptionPage : System.Windows.Controls.UserControl
    {
        FolderBrowserDialog fb = new FolderBrowserDialog();
        OpenFileDialog ofd = new OpenFileDialog();
        public CreateYoutubeVideoDescriptionPage()
        {
            InitializeComponent();
        }

        MatchCollection Match(string patt, string text)
        {
            // Create a Regex  
            Regex rg = new Regex(patt, RegexOptions.Compiled | RegexOptions.IgnoreCase);

            // Get all matches  
            MatchCollection matches = rg.Matches(text);

            return matches;
        }
        private List<Topic> LoadTopics(string fileName)
        {
            var res = new List<Topic>();

            using (var reader = new StreamReader(fileName))
            {
                string numberPatter = @"(?<num>\d+)";
                string descPatter = @"(?<vers>.+)";

                string text = "";
                var topic = new Topic();

                while (!reader.EndOfStream)
                {
                    text = reader.ReadLine();

                    if (text != "")
                    {
                        //Number
                        var matches = Match(numberPatter, text);

                        if (matches.Count > 0)
                            topic.Number = matches[0].Groups["num"].Value;
                        else
                        {
                            matches = Match(descPatter, text);
                            if (matches.Count > 0)
                                topic.Description = matches[0].Groups["vers"].Value;
                        }
                    }

                    if (Topic.ValidTopic(topic))
                    {
                        res.Add(topic);
                        topic = new Topic();
                    }
                }

                reader.Close();
                reader.Dispose();
            }

            return res;
        }

        private void UserControl_Loaded(object sender, RoutedEventArgs e)
        {
            startDate_dp.SelectedDate = DateTime.Now;
        }

        private void browseTopics_bt_Click(object sender, RoutedEventArgs e)
        {
            if (ofd.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                topics_tb.Text = ofd.FileName;
            }
        }

        private void generateDescription_bt_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (chapterName_tb.Text == null || chapterName_tb.Text == "")
                    throw new InvalidOperationException("You must provide a valid Chapter Name");

                if (!File.Exists(topics_tb.Text))
                    throw new InvalidOperationException("You must provide a valid Topic file and a valid DescriptionFormat file");

                if(fb.ShowDialog() != DialogResult.OK)
                    throw new InvalidOperationException("You must provide a valid folder to save Video Description fils ");

                //Load Settings
                Settings settings = new Settings { ChaptersCountByDay = 2 };
                if (File.Exists("Settings.xml"))
                    settings = MySerializer<Settings>.Deserialize("Settings.xml");

                var desc = MySerializer<YoutubeVideoDescription>.Deserialize(@"Youtube Video Description/chapter sample.xml");
                var v = desc.OtherVideos;
                var line = "=======================================================================";
                var shortLine = "==============";
                var nl = Environment.NewLine;
                var starting = int.Parse(startingAt_tb.Text);

                var topics = LoadTopics(topics_tb.Text);
                string format,fileName,name = "";

                int processed = 0;

                var date = startDate_dp.SelectedDate.Value;
                var chapterCount = 0;

                foreach (var topic in topics.Where(t => int.Parse(t.Number) >= starting))
                {
                    fileName = $"La Biblia de Jerusalen Audio Es - {chapterName_tb.Text} {topic.Number}.txt";
                    name = $"{chapterName_tb.Text} {topic.Number}";

                    format = $"{line}{nl}Description {date.ToLongDateString()}" +
                        $"{nl}{line}{nl}{desc.ChapterName} {chapterName_tb.Text} {topic.Number}{nl}{topic.Description}" +
                        $"{nl}{nl}{desc.Comment}{nl}{nl}{desc.LinkToBible}{nl}{nl}{shortLine}{nl}Otros Videos{nl}{shortLine}{nl}" +
                        $"{v[0].Name}{nl}{v[0].Link}{nl}{nl}{v[1].Name}{nl}{v[1].Link}{nl}{nl}{line}{nl}Tags{nl}{line}{nl}{name},{desc.Tags}";

                    using (var writer = new StreamWriter(System.IO.Path.Combine(fb.SelectedPath, fileName)))
                    {
                        writer.WriteLine(format);
                    }

                    processed++;
                    chapterCount++;

                    if (chapterCount == settings.ChaptersCountByDay)
                    {
                        chapterCount = 0;
                        date = date.AddDays(1);
                    }
                }

                System.Windows.MessageBox.Show($"Successfully generates {processed} Video Descriptions");
            }
            catch (Exception ex)
            {
                System.Windows.MessageBox.Show(ex.Message);
            }
        }

        private void main_grid_Drop(object sender, System.Windows.DragEventArgs e)
        {
            var source = new List<string>((string[])e.Data.GetData("FileDrop")).First();

            chapterName_tb.Text = System.IO.Path.GetFileNameWithoutExtension(source);

            topics_tb.Text = source;
        }
       
    }
}
