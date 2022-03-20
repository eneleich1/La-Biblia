using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace BibleEditor.Tools
{
    public class Settings
    {
        #region Youtube Video Description

        [XmlElement]
        public int ChaptersCountByDay { get; set; }

        #endregion
    }
}
