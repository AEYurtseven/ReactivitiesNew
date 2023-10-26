using Application.Core;
using Application.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class ListActivities
    {
        public class Query : IRequest<Result<List<UserActivityDto>>>
        {
            public string Predicate { get; set; }
            public string Username { get; set; }
        }

        public class Handler : IRequestHandler<Query, Result<List<UserActivityDto>>>
        {
            public readonly DataContext _context;
            public readonly IMapper _mapper;
            public readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IMapper mapper, IUserAccessor userAccessor)
            {
                _context = context;
                _mapper = mapper;
                _userAccessor = userAccessor;
            }

            public async Task<Result<List<UserActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var query =  _context.ActivityAttendees.Where(u => u.AppUser.UserName == _userAccessor.GetUserName()).ProjectTo<UserActivityDto>(_mapper.ConfigurationProvider).OrderBy(d => d.Date).AsQueryable();

                switch (request.Predicate)
                {
                    case "past":
                        query.Where(d => d.Date <= DateTime.Now);
                        break;
                    case "future":
                        query.Where(d => d.Date >= DateTime.Now);
                        break;
                    case "hosting":
                        query.Where(d => d.HostUsername == request.Username);
                        break;
                }
                
                var activities = await query.ToListAsync();

                return Result<List<UserActivityDto>>.Success(activities);
            }
        }
    }
}