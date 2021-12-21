using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace BibleEditor.Tools
{
    public class Configuration
    {
        public static Configuration MainConfiguration;

        public static void LoadConfiguration()
        {
            MainConfiguration = MySerializer<Configuration>.Deserialize("MainConfiguration.xml");
            if(MainConfiguration==null)MainConfiguration = new Configuration();
        }

        public static void SaveConfiguration()
        {
            //MainConfiguration = new Configuration()
            //{
            //    ChaptersPath = @"D:\Cristianity\La Biblia\00 - Antiguo Testamento\23- LOS SALMOS",
            //    LoadDefaultComponent = true,
            //    DefaultComponent = "CreateChapters"
            //};
            MySerializer<Configuration>.Serialize(MainConfiguration, "MainConfiguration.xml");
        }

        [XmlElement]
        public string ChaptersPath { get; set; }

        [XmlAttribute]
        public bool LoadDefaultComponent { get; set; }

        [XmlAttribute]
        public string DefaultComponent { get; set; }
    }
}
