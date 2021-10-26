using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Text.Json;
using System.Text.Encodings.Web;
using System.Text.Unicode;

namespace GetAllChaptersInfo
{
    class Program
    {
        static void Main(string[] args)
        {
            var path =@"D:\Cristianity\La Biblia\00 - Antiguo Testamento";

            var dinfo = new DirectoryInfo(path);

            var q = new Queue<DirectoryInfo>();

            q.Enqueue(dinfo);

            var chapters = new List<Chapter>();

            while (q.Count > 0)
            {
                var d = q.Dequeue();

                foreach (var di in d.GetDirectories())
                {
                    q.Enqueue(di);
                }

                foreach (var fi in d.GetFiles())
                {
                    chapters.Add(new Chapter
                    {
                         Name = fi.Name,
                         Path = fi.FullName,
                    });
                }
            }

            var writer = new StreamWriter(new FileStream("chapters.json", FileMode.Create, FileAccess.Write),Encoding.Unicode);

            var options = new JsonSerializerOptions
            {
                Encoder = JavaScriptEncoder.Create(UnicodeRanges.All, UnicodeRanges.Cyrillic),
                WriteIndented = true
            };

            string jsonString = JsonSerializer.Serialize(chapters, options);

            writer.Write(jsonString);
            writer.Close();
            writer.Dispose();
        }
    }

    public class Chapter
    {
        public string Name { get; set; }
        public string Path { get; set; }
    }
}
