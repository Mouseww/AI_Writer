using System.ComponentModel.DataAnnotations;

namespace AIWriter.Dtos
{
    public class AgentCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        public string Prompt { get; set; }

        [Required]
        [MaxLength(100)]
        public string Model { get; set; }

        [Required]
        public int Order { get; set; }
    }

    // For now, Update is the same as Create. This can be extended later if needed.
    public class AgentUpdateDto : AgentCreateDto
    {
    }
}
