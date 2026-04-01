using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using School_Management.API.CustomActionFilter;
using School_Management.API.Models.DTO;
using School_Management.API.Services;

namespace School_Management.API.Controllers
{
    [Route("api/events")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly IEventService eventService;

        public EventsController(IEventService eventService)
        {
            this.eventService = eventService;
        }

        [HttpPost]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateEvent([FromBody] PostOrUpdateEventRequest request)
        {
            var result = await eventService.CreateEvent(request);
            return StatusCode(201, result);
        }

        [HttpPut]
        [ValidateModel]
        [Authorize(Roles = "Admin")]
        [Route("{eventId}")]
        public async Task<IActionResult> UpdateEvent([FromBody] PostOrUpdateEventRequest request, [FromRoute] Guid eventId)
        {
            var result = await eventService.UpdateEvent(request, eventId);
            return Ok(result);
        }

        [HttpGet]
        [ValidateModel]
        [Authorize]
        public async Task<IActionResult> GetAllEvents([FromQuery] EventFilterRequest request)
        {
            if (request.SortBy == null) request.SortBy = "StartTime";
            if (request.PageNumber <= 0) request.PageNumber = 1;
            if (request.PageSize <= 0) request.PageSize = 10;
            var result = await eventService.GetAllEvent(request);
            return Ok(result);
        }

        [HttpGet]
        [Authorize]
        [Route("{eventId}")]
        public async Task<IActionResult> GetEventById([FromRoute] Guid eventId)
        {
            var result = await eventService.GetEventById(eventId);
            return Ok(result);
        }
    }
}
