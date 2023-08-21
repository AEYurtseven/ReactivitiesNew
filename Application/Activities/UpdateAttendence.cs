using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Persistence;

namespace Application.Activities
{
    public class UpdateAttendence
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id {get;set;}

        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            public Handler(DataContext context, IUserAccessor userAccessor){
                _userAccessor = userAccessor;
                _context = context;
            }
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await _context.Activities.Include(a => a.Attendees).ThenInclude(u => u.AppUser).SingleOrDefaultAsync(x => x.Id == request.Id);

                if(activity == null) return null;
                var user = await _context.Users.FirstOrDefaultAsync(
                    x=> x.UserName == _userAccessor.GetUserName()
                );

                if(user == null) return null;

                var hostUsername = activity.Attendees.FirstOrDefault(x => x.IsHost)?.AppUser.UserName;

                var attandence = activity.Attendees.FirstOrDefault(x => x.AppUser.UserName == user.UserName);

                if(attandence != null && hostUsername == user.UserName){
                    activity.IsCanceled = !activity.IsCanceled;
                }

                if(attandence != null && hostUsername != user.UserName){
                    activity.Attendees.Remove(attandence);
                }

                if(attandence == null){
                    attandence = new ActivityAttendee{
                        AppUser = user,
                        Activity = activity,
                        IsHost = false
                    };

                    activity.Attendees.Add(attandence);
                }

                var result = await _context.SaveChangesAsync() > 0;

                return result ? Result<Unit>.Success(Unit.Value) : Result<Unit>.Failure("Problem updating attendance");
            }   
        }
    }
}