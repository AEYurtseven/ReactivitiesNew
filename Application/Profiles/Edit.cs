using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Application.Core;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class Edit
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Profile Profile { get; set; }
        }

        public class CommandValidator: AbstractValidator<Command>{
            public CommandValidator(){
                RuleFor(x => x.Profile).SetValidator(new ProfileValidator());
            }
        }

        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper){
                _context = context;
                _mapper = mapper;
            }

            
            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            { 
                var user = await _context.Users.FirstOrDefaultAsync(x => x.DisplayName == request.Profile.DisplayName);

                if (user is null) return null;

                user.Bio = request.Profile.Bio ?? user.Bio;
                user.DisplayName = request.Profile.DisplayName ?? user.DisplayName;

                var result = await _context.SaveChangesAsync() > 0;

                 if(result) return Result<Unit>.Success(Unit.Value);

                return Result<Unit>.Failure("Failed to edit activity");
            }
        }

    }
}