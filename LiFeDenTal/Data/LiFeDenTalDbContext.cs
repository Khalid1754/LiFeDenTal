using Microsoft.EntityFrameworkCore;
using LiFeDenTal.Models;

namespace LiFeDenTal.Data;

public class LiFeDenTalDbContext : DbContext
{
    public LiFeDenTalDbContext(DbContextOptions<LiFeDenTalDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Dentist> Dentists => Set<Dentist>();
    public DbSet<ClinicStaff> ClinicStaff => Set<ClinicStaff>();
    public DbSet<TreatmentRoom> TreatmentRooms => Set<TreatmentRoom>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ---- User ----
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();

            entity.HasOne(u => u.PatientProfile)
                .WithOne(p => p.User)
                .HasForeignKey<Patient>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(u => u.DentistProfile)
                .WithOne(d => d.User)
                .HasForeignKey<Dentist>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(u => u.StaffProfile)
                .WithOne(s => s.User)
                .HasForeignKey<ClinicStaff>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ---- Patient ----
        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasIndex(p => p.PersonalIdentityNumber).IsUnique();
        });

        // ---- Dentist ----
        modelBuilder.Entity<Dentist>(entity =>
        {
            entity.HasIndex(d => d.LicenseNumber).IsUnique();
        });

        // ---- TreatmentRoom ----
        modelBuilder.Entity<TreatmentRoom>(entity =>
        {
            entity.HasIndex(r => r.Name).IsUnique();
        });

        // ---- Appointment ----
        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasOne(a => a.Patient)
                .WithMany(p => p.Appointments)
                .HasForeignKey(a => a.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(a => a.Dentist)
                .WithMany(d => d.Appointments)
                .HasForeignKey(a => a.DentistId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(a => a.TreatmentRoom)
                .WithMany(r => r.Appointments)
                .HasForeignKey(a => a.TreatmentRoomId)
                .OnDelete(DeleteBehavior.Restrict);

            // Snabbare sökningar på "är rummet/tandläkaren ledig vid denna tid"
            entity.HasIndex(a => new { a.TreatmentRoomId, a.StartTime });
            entity.HasIndex(a => new { a.DentistId, a.StartTime });
        });

        // ---- MedicalRecord ----
        modelBuilder.Entity<MedicalRecord>(entity =>
        {
            entity.HasOne(m => m.Patient)
                .WithMany(p => p.MedicalRecords)
                .HasForeignKey(m => m.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.Dentist)
                .WithMany(d => d.MedicalRecords)
                .HasForeignKey(m => m.DentistId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(m => m.Appointment)
                .WithMany()
                .HasForeignKey(m => m.AppointmentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ---- Seed: tre behandlingsrum ----
        modelBuilder.Entity<TreatmentRoom>().HasData(
            new TreatmentRoom { Id = 1, Name = "Rum 1", IsActive = true },
            new TreatmentRoom { Id = 2, Name = "Rum 2", IsActive = true },
            new TreatmentRoom { Id = 3, Name = "Rum 3", IsActive = true }
        );

        var adminId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var dentistUserId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = adminId,
                Email = "admin@lifedental.se",
                FirstName = "Khalid",
                LastName = "Hassan",
                Role = UserRole.Admin,
                PasswordHash = "",
                Password = "Admin123!",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = dentistUserId,
                Email = "dentist@lifedental.se",
                FirstName = "Hirsi",
                LastName = "Aden",
                Role = UserRole.Dentist,
                PasswordHash = "",
                Password = "Dentist123!",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );




    }

}