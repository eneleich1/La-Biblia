using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace HtmlWriter
{
    class Program
    {
        static void Main(string[] args)
        {

            var writer = new StreamWriter(new FileStream("page.html", FileMode.Create, FileAccess.ReadWrite));
            var startReader = new StreamReader(new FileStream("start.txt", FileMode.Open, FileAccess.Read));
            var endReader = new StreamReader(new FileStream("end.txt", FileMode.Open, FileAccess.Read));

            string chapter = "";
            string tabs = "\t\t\t\t\t\t";

            using (writer)
            {

                writer.Write(startReader.ReadToEnd());

                writer.WriteLine();

                for (int i = 1; i <= 150; i++)
                {
                    chapter = i < 10 ? "0" + i.ToString() : i.ToString();

                    writer.WriteLine(tabs + "<button type = 'button' class='btn btn-default chapter'>");

                    writer.WriteLine(tabs + string.Format("<a class='chapter-a' href='../23- LOS SALMOS/Salmo {0}.html'>{0}</a>", chapter));

                    writer.WriteLine(tabs + "</button>");

                    writer.WriteLine();
                }

                writer.Write(endReader.ReadToEnd());
            }
        }
    }
}
