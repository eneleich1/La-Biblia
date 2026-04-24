using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BibleEditor.Tools
{
    public class Chapter
    {
        public string Name;
        public int Number;
        public List<string> Versicles = new List<string>();

        public override string ToString()
        {
            return $"{Name} {Number}";
        }
    }
}
