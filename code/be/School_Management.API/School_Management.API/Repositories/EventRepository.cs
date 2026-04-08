using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly ApplicationDbContext context;

        public EventRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<(EventResponse? data, string? errorCode)> CreateEvent(PostOrUpdateEventRequest request)
        {
            if (request.StartTime >= request.FinishTime) return (null, "INVALID_TIME");
            var titleName = request.Title.Trim().ToLower();
            var isExisted = await context.Event.AnyAsync(x => x.SchoolYear == request.SchoolYear
                                                     && x.Term == request.Term
                                                     && x.StartTime == request.StartTime
                                                     && x.EventDate == request.EventDate
                                                     && x.Title.ToLower() == titleName);
            if (isExisted) return (null, "DUPLICATE_TITLE");

            var newEvent = new Event
            {
                Id = Guid.NewGuid(),
                Body = request.Body,
                Title = request.Title.Trim(),
                FinishTime = request.FinishTime,
                SchoolYear = request.SchoolYear,
                StartTime = request.StartTime,
                EventDate = request.EventDate,
                Term = request.Term

            };

            context.Event.Add(newEvent);
            await context.SaveChangesAsync();
            return (new EventResponse
            {
                EventId = newEvent.Id,
                Body = newEvent.Body,
                SchoolYear = newEvent.SchoolYear,
                FinishTime = newEvent.FinishTime,
                StartTime = newEvent.StartTime,
                Term = newEvent.Term,
                EventDate = request.EventDate,
                Title = newEvent.Title
            }, "SUCCESS");
        }

        public async Task<PagedResponse<EventResponse>> GetAllEvent(EventFilterRequest request)
        {
            var query = context.Event.AsNoTracking()
                                     .Where(x => x.SchoolYear == request.SchoolYear
                                           && x.Term == request.Term);

            //Filtering
            if(!string.IsNullOrWhiteSpace(request.Title))
            {
                var title = request.Title.Trim().ToLower();
                query = query.Where(x => x.Title.ToLower().Contains(title));
            }
            if(!string.IsNullOrWhiteSpace(request.Body))
            {
                var body = request.Body.Trim().ToLower();
                query = query.Where(x => x.Body.ToLower().Contains(body));
            }
            if(request.EventDate.HasValue)
                query = query.Where(x => x.EventDate == request.EventDate.Value);
            if (request.StartTime.HasValue)
                query = query.Where(x => x.StartTime >= request.StartTime.Value);

            //Sorting
            if(!string.IsNullOrWhiteSpace(request.SortBy))
            {
                if (request.SortBy.Equals("EventDate", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending
                            ? query.OrderBy(x => x.EventDate).ThenBy(x => x.StartTime)
                            : query.OrderByDescending(x => x.EventDate).ThenByDescending(x => x.StartTime);
                }
            }

            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;
            var listEvents = await query
                .Skip(skipResults)
                .Take(request.PageSize)
                .Select(x => new EventResponse
            {
                    EventId = x.Id,
                    Body = x.Body,
                    SchoolYear = x.SchoolYear,
                    StartTime = x.StartTime,
                    Term = x.Term,
                    EventDate = x.EventDate,
                    FinishTime = x.FinishTime,
                    Title = x.Title
            }).ToListAsync();

            return new PagedResponse<EventResponse>
            {
                TotalCount = totalCount,
                Items = listEvents,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber
            };
        }

        public async Task<(EventResponse? data, string? errorCode)> GetEventById(Guid eventId)
        {
            var myEvent = await context.Event.AsNoTracking().Where(x => x.Id == eventId).FirstOrDefaultAsync();
            if (myEvent == null) return (null, "NOT_FOUND_EVENT");

            return (new EventResponse
            {
                EventId = myEvent.Id,
                SchoolYear = myEvent.SchoolYear,
                StartTime = myEvent.StartTime,
                FinishTime = myEvent.FinishTime,
                Body = myEvent.Body,
                EventDate = myEvent.EventDate,
                Term = myEvent.Term,
                Title = myEvent.Title
            }, "SUCCESS");
        }

        public async Task<(EventResponse? data, string? errorCode)> UpdateEvent(PostOrUpdateEventRequest request, Guid eventId)
        {
            var myEvent = await context.Event.Where(x => x.Id == eventId).FirstOrDefaultAsync();
            if (myEvent == null) return (null, "NOT_FOUND_EVENT");

            if (request.StartTime >= request.FinishTime) return (null, "INVALID_TIME");
            var titleName = request.Title.Trim().ToLower();
            var isExisted = await context.Event.AnyAsync(x => x.SchoolYear == request.SchoolYear
                                                     && x.Term == request.Term
                                                     && x.StartTime == request.StartTime
                                                     && x.EventDate == request.EventDate
                                                     && x.Title.ToLower() == titleName
                                                     && x.Id != eventId);
            if (isExisted) return (null, "DUPLICATE_TITLE");

            myEvent.SchoolYear = request.SchoolYear;
            myEvent.Term = request.Term;
            myEvent.StartTime = request.StartTime;
            myEvent.FinishTime = request.FinishTime;
            myEvent.Title = request.Title;
            myEvent.EventDate = request.EventDate;
            myEvent.Body = request.Body;

            context.Event.Update(myEvent);
            await context.SaveChangesAsync();

            return (new EventResponse
            {
                EventId = myEvent.Id,
                Term = myEvent.Term,
                SchoolYear = myEvent.SchoolYear,
                StartTime = myEvent.StartTime,
                Body = myEvent.Body,
                EventDate = myEvent.EventDate,
                FinishTime = myEvent.FinishTime,
                Title = myEvent.Title
            }, "SUCCESS");

        }
    }
}
