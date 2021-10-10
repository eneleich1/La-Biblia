using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Text.RegularExpressions;

namespace FormatString
{
    class Program
    {
        static void Main(string[] args)
        {
            //var reader = new StreamReader(new FileStream("Salmos.txt",FileMode.Open,FileAccess.Read));
            //var writer = new StreamWriter(new FileStream("SalmosFormatted.txt",FileMode.Create,FileAccess.Write));

            //var formatted = reader.ReadToEnd().Replace(Environment.NewLine + Environment.NewLine, Environment.NewLine);
            //reader.Close();
            //reader.Dispose();

            //writer.Write(formatted);
            //writer.Close();
            //writer.Dispose();

            var chapters = GetChapter("SalmosFormatted.txt");

            Console.WriteLine("Task Completle");
            Console.ReadLine();

        }

        private static List<Chapter> GetChapter(string filePath)
        {

            var chapters = new List<Chapter>();

            var reader = new StreamReader(new FileStream(filePath, FileMode.Open, FileAccess.Read));

            string namePatter = @"Salmo\s+(?<num>\d+)";
            string versiclePatter = @"(?<index>\d+\.)(?<vers>.+)";


            string text = "";
            Chapter chapter = new Chapter();
            while (!reader.EndOfStream)
            {
                text = reader.ReadLine();

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

            if (chapter.Versicles.Count > 0)
                chapters.Add(chapter);

            reader.Close();
            reader.Dispose();

            return chapters;
        }

        static MatchCollection Match(string patt,string text)
        {
            // Create a Regex  
            Regex rg = new Regex(patt);

            // Get all matches  
            MatchCollection matches = rg.Matches(text);

            return matches;
        }
    }

    class Chapter
    {
        public string Name;
        public int Number;
        public List<string> Versicles=new List<string>();

        public override string ToString()
        {
            return $"{Name} {Number}";
        }
    } 
}
