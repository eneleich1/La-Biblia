using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Text.RegularExpressions;

namespace BibleEditor
{
    public class HtmlNode
    {
        public string Name { get; set; }
        public List<HtmlNode> Children = new List<HtmlNode>();
        public List<NodeAtt> Atts = new List<NodeAtt>();
        public string Content { get; set; }
        public bool ContentFirsth = true;

        public HtmlNode AddChild(string html)
        {
            var n = ParseHtml(html);
            Children.Add(n);
            return n;
        }

        public void AddChild(HtmlNode n)
        {
            Children.Add(n);
        }

        public string GetAttString()
        {
            var s= "";

            foreach (NodeAtt att in Atts)
            {
                s+=$" {att.Name} = \"{att.Value}\"";
            }

            return s;
        }

        /// <summary>
        /// Write all Node html to the specific stream writer
        /// </summary>
        /// <param name="writer"></param>
        public void Write(StreamWriter writer)
        {
            writer.WriteLine($"<{Name} {GetAttString()}>");

            if (ContentFirsth)
            {

                //Content
                if (Content != null && Content != "")
                    writer.WriteLine(Content);

                //Children
                if (Children.Count > 0)
                    foreach (var node in Children)
                        node.Write(writer);
            }
            else
            {
                //Children
                if (Children.Count > 0)
                    foreach (var node in Children)
                        node.Write(writer);

                //Content
                if (Content != null && Content != "")
                    writer.WriteLine(Content);
            }

            writer.WriteLine($"</{Name}>");
        }

        public static HtmlNode ParseHtml(string html)
        {
            var n = new HtmlNode();

            var quote = "[\"']";
            var value = $"(?<value>[\\w\\d\\s_-]+)";
            string pattern = $"<(?<name>\\w+)(\\s+(?<att>\\w+)\\s*=\\s*{quote}(?<value>.+){quote})*";

            // Create a Regex  
            Regex rg = new Regex(pattern);

            // Get all matches 
            MatchCollection matches = rg.Matches(html);

            var atts = new List<string>();
            var values = new List<string>();

            // Print all matched authors  
            if (matches.Count > 0)
            {
                foreach (Match match in matches)
                {
                    n.Name = match.Groups["name"].Value;
                    foreach (Capture c in match.Groups["att"].Captures)
                        atts.Add(c.Value);
                    foreach (Capture c in match.Groups["value"].Captures)
                        values.Add(c.Value);
                }

                for (int i = 0; i < atts.Count; i++)
                    n.Atts.Add(new NodeAtt { Name = atts[i], Value = values[i] });

                return n;
            }
            else return null;
        }

        public override string ToString()
        {
            return $"<{Name}>...</{Name}>";
        }

    }

    public class HtmlPage
    {
        public HtmlNode Html { get; set; }

        public void Write(StreamWriter writer)
        {
            writer.WriteLine($"<!DOCTYPE html>");

            Html.Write(writer);
        }
    }

    public class NodeAtt
    {
        public string Name { get; set; }
        public string Value { get; set; }

        public override string ToString()
        {
            return $"{Name} = {Value}";
        }
    }
}
